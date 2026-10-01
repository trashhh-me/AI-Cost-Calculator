/*
 * AI DEX: local exhibition server
 * ------------------------------------------------------------------
 * - Serves the exhibit from ./public
 * - POST /api/chat   streams an AI answer as newline-delimited JSON
 * - POST /api/stop   stops an answer that is still streaming
 * - GET  /api/status tells the page which model is live and how many
 *                    questions this visit has left
 *
 * The API key is read from .env and never sent to the browser.
 * Run:  npm start          (live, if a key is set)
 *       npm run demo       (sample answers only)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { CONFIG, costUSD } from './public/js/config.js';
import { SpendLedger, VisitCounter } from './server/limits.js';
import { countConversation, countTokens } from './server/tokenizer.js';
import * as demo from './server/providers/demo.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
loadDotEnv(path.join(ROOT, '.env'));

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // kiosk: only this machine
const DEMO_FORCED = CONFIG.demoMode || process.env.AI_DEX_DEMO === '1' || process.argv.includes('--demo');

const PROVIDER = CONFIG.provider;
const MODEL = CONFIG.models[PROVIDER];
const KEY_NAMES = { anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY' };
const API_KEY = process.env[KEY_NAMES[PROVIDER]] || '';
const ADAPTERS = {
  anthropic: () => import('./server/providers/anthropic.js'),
  openai: () => import('./server/providers/openai.js'),
  gemini: () => import('./server/providers/gemini.js'),
};
if (!ADAPTERS[PROVIDER]) throw new Error(`Unknown provider "${PROVIDER}" in public/js/config.js`);
if (!CONFIG.prices[MODEL]) console.warn(`[ai-dex] No price for "${MODEL}" in config.js; the cost line will be blank.`);

const ledger = new SpendLedger(path.join(ROOT, 'data'));
const visits = new VisitCounter(CONFIG.limits.maxQuestionsPerVisit);
const running = new Map(); // requestId -> { controller, stopped }

/* ---------------- Helpers ---------------- */

// Minimal .env reader (KEY=value per line), so no extra dependency is needed.
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

function modelLabel(model) {
  return CONFIG.modelLabels[model] || model;
}

function sendJSON(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 200_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('too large'), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(Object.assign(new Error('bad json'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

// Upper bound for one request's cost, used to stop before the cap is crossed.
function worstCaseCost(messages) {
  const input = countConversation(CONFIG.systemPrompt, messages) * 1.3; // other tokenizers count more
  return costUSD(MODEL, input, CONFIG.limits.maxOutputTokens) ?? 0;
}

function capReached(extra = 0) {
  return ledger.spentToday() + extra >= CONFIG.limits.dailySpendCapUSD;
}

// Why the live AI is not being used, or null if it is available.
function liveBlocker(messages) {
  if (DEMO_FORCED) return 'demo';
  if (!API_KEY) return 'nokey';
  if (capReached(messages ? worstCaseCost(messages) : 0)) return 'cap';
  return null;
}

// Turn a provider error into one of the visitor-facing states.
function classifyError(err) {
  const status = err?.status ?? err?.code;
  const msg = String(err?.message || '').toLowerCase();
  if (/credit balance|billing|quota|insufficient|payment/.test(msg) || status === 402) return 'credit';
  if (status === 429) return 'rate';
  if (status === 401 || status === 403) return 'auth';
  if (status === undefined || /fetch failed|network|enotfound|econn|etimedout|socket/.test(msg)) return 'network';
  return 'error';
}

function validMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 2 * CONFIG.limits.maxQuestionsPerVisit) return false;
  let userTurns = 0;
  for (const [i, m] of messages.entries()) {
    if (!m || typeof m.content !== 'string' || !m.content.trim()) return false;
    const expected = i % 2 === 0 ? 'user' : 'assistant';
    if (m.role !== expected) return false;
    if (m.role === 'user') {
      userTurns++;
      if (m.content.length > CONFIG.limits.maxPromptChars) return false;
    } else if (m.content.length > 20_000) return false;
  }
  return messages[messages.length - 1].role === 'user' && userTurns <= CONFIG.limits.maxQuestionsPerVisit;
}

/* ---------------- API: chat ---------------- */

async function handleChat(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return sendJSON(res, e.status || 400, { error: 'bad_request' });
  }
  const { messages, visitId } = body;
  if (typeof visitId !== 'string' || visitId.length > 100 || !validMessages(messages)) {
    return sendJSON(res, 400, { error: 'bad_request' });
  }
  if (!visits.take(visitId)) return sendJSON(res, 429, { error: 'limit' });

  const requestId = crypto.randomUUID();
  const controller = new AbortController();
  const job = { controller, stopped: false };
  running.set(requestId, job);

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Accel-Buffering': 'no',
  });
  const send = (obj) => {
    if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n');
  };
  // If the page goes away (reset, reload), stop the upstream call too.
  res.on('close', () => {
    if (!res.writableEnded) job.controller.abort();
  });

  let reason = liveBlocker(messages);
  let live = reason === null;
  let usage = { input: null, output: null, thinking: null, model: null, parts: null };
  let text = '';

  send({ type: 'meta', requestId, live, reason, model: MODEL, modelLabel: modelLabel(MODEL) });

  const run = async (adapter, opts) => {
    for await (const piece of adapter.streamChat(opts)) {
      text += piece;
      send({ type: 'delta', text: piece });
    }
  };
  const baseOpts = {
    model: MODEL,
    system: CONFIG.systemPrompt,
    messages,
    maxTokens: CONFIG.limits.maxOutputTokens,
    signal: controller.signal,
  };

  if (live) {
    // Watchdog: a visitor should not stare at "thinking" for ever.
    const watchdog = setTimeout(() => {
      if (!text) {
        job.timedOut = true;
        controller.abort();
      }
    }, CONFIG.limits.firstWordsTimeoutSeconds * 1000);
    try {
      const adapter = await ADAPTERS[PROVIDER]();
      await run(adapter, { ...baseOpts, apiKey: API_KEY, options: CONFIG.providerOptions[PROVIDER], usage });
    } catch (err) {
      if (!job.stopped) {
        // The live AI failed: record anything already generated, then answer
        // with a clearly labelled sample instead of leaving a dead screen.
        reason = job.timedOut ? 'network' : classifyError(err);
        console.warn(`[ai-dex] live answer failed (${reason}):`, err?.message || err);
        if (text) {
          const partial = costUSD(MODEL, usage.input ?? countConversation(CONFIG.systemPrompt, messages), countTokens(text));
          ledger.add(partial ?? 0);
        }
        live = false;
        text = '';
        usage = { input: null, output: null, thinking: null, model: null, parts: null };
        send({ type: 'fallback', reason });
      }
    } finally {
      clearTimeout(watchdog);
    }
  }

  if (!live && !job.stopped) {
    try {
      const sampleController = new AbortController();
      if (job.timedOut) job.controller = sampleController; // the first one is spent
      const signal = job.timedOut ? sampleController.signal : controller.signal;
      await run(demo, { ...baseOpts, signal, usage });
    } catch {
      /* stopped */
    }
  }

  // Exact counts come from the provider. When an answer was stopped before
  // the provider reported them, count locally and say so.
  const exact = { input: usage.input != null, output: usage.output != null && !job.stopped };
  const input = usage.input ?? countConversation(CONFIG.systemPrompt, messages);
  const output = job.stopped ? Math.max(usage.output ?? 0, countTokens(text)) : usage.output ?? countTokens(text);

  let cost = null;
  if (live) {
    cost = usage.parts
      ? usage.parts.reduce((s, p) => s + (costUSD(p.model, p.input, p.output) ?? costUSD(MODEL, p.input, p.output) ?? 0), 0)
      : costUSD(MODEL, input, output);
    ledger.add(cost ?? 0);
  }

  send({
    type: 'usage',
    live,
    sample: !live,
    input,
    output,
    thinking: usage.thinking,
    exact: live ? exact : { input: false, output: false },
    model: live ? usage.model || MODEL : MODEL,
    costUSD: cost, // actual charge (live answers only)
    priceModel: MODEL, // the configured model, whose price the bill uses
  });
  send({
    type: 'done',
    reason: job.stopped ? 'stopped' : 'complete',
    remaining: Math.max(0, CONFIG.limits.maxQuestionsPerVisit - visits.used(visitId)),
    capReached: reason === 'cap' || capReached(),
  });
  running.delete(requestId);
  res.end();
}

async function handleStop(req, res) {
  let body;
  try {
    body = await readBody(req, 2_000);
  } catch {
    return sendJSON(res, 400, { error: 'bad_request' });
  }
  const job = running.get(body.requestId);
  if (job) {
    job.stopped = true;
    job.controller.abort();
  }
  sendJSON(res, 200, { ok: true });
}

function handleStatus(req, res, url) {
  const visitId = url.searchParams.get('visit') || '';
  const reason = liveBlocker(null);
  sendJSON(res, 200, {
    live: reason === null,
    reason,
    provider: PROVIDER,
    model: MODEL,
    modelLabel: modelLabel(MODEL),
    maxQuestions: CONFIG.limits.maxQuestionsPerVisit,
    remaining: Math.max(0, CONFIG.limits.maxQuestionsPerVisit - visits.used(visitId)),
  });
}

/* ---------------- Static files ---------------- */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function serveStatic(req, res, url) {
  let rel;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const ext = path.extname(file).toLowerCase();
    const cache = ext === '.woff2' || rel.includes('/vendor/') ? 'public, max-age=86400' : 'no-cache';
    res.writeHead(200, {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': cache,
      ...SECURITY_HEADERS,
    });
    fs.createReadStream(file).pipe(res);
  });
}

/* ---------------- Server ---------------- */

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/chat' && req.method === 'POST') return handleChat(req, res);
  if (url.pathname === '/api/stop' && req.method === 'POST') return handleStop(req, res);
  if (url.pathname === '/api/status' && req.method === 'GET') return handleStatus(req, res, url);
  if (url.pathname.startsWith('/api/')) return sendJSON(res, 404, { error: 'not_found' });
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }
  serveStatic(req, res, url);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Is AI DEX already running? Set PORT in .env to use another port.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  const mode = DEMO_FORCED ? 'DEMO (sample answers)' : API_KEY ? `LIVE via ${PROVIDER}` : 'DEMO (no API key found)';
  console.log(`AI DEX running at http://${HOST}:${PORT}`);
  console.log(`Mode: ${mode} · model: ${modelLabel(MODEL)}`);
  console.log(`Daily cap: $${CONFIG.limits.dailySpendCapUSD.toFixed(2)} · spent today: $${ledger.spentToday().toFixed(4)}`);
  if (!DEMO_FORCED && !API_KEY) explainMissingKey();
});

// Say exactly why no key was found, so it is easy to fix at the venue.
function explainMissingKey() {
  const keyName = KEY_NAMES[PROVIDER];
  const envFile = path.join(ROOT, '.env');
  console.log(`\nNo ${keyName} found. The provider in public/js/config.js is "${PROVIDER}".`);
  if (!fs.existsSync(envFile)) {
    console.log(`There is no .env file at ${envFile}`);
    for (const wrong of ['.env.txt', '.env.rtf', 'env', 'env.txt', '.env.example']) {
      if (wrong !== '.env.example' && fs.existsSync(path.join(ROOT, wrong))) {
        console.log(`Found "${wrong}" instead: rename it to exactly ".env" (plain text).`);
      }
    }
  } else {
    const text = fs.readFileSync(envFile, 'utf8');
    const other = Object.entries(KEY_NAMES).find(([p, k]) => p !== PROVIDER && new RegExp(`^\\s*${k}\\s*=\\s*\\S`, 'm').test(text));
    if (other) console.log(`.env has ${other[1]}: did you mean provider: '${other[0]}' in config.js?`);
    else if (text.includes('{\\rtf')) console.log('.env was saved as rich text: save it as plain text.');
    else console.log(`.env exists but has no line like: ${keyName}=your-key`);
  }
  console.log('Then stop (Ctrl + C) and run npm start again.\n');
}

// Part 2: the tokens. Counts always come from the AI provider's usage data.
// The visual split into pieces uses OpenAI's o200k tokenizer, bundled
// locally: exact for OpenAI models, an honest approximation for others.
import { CONFIG } from './config.js';
import { TEXT } from './content.js';
import { int } from './format.js';

const $ = (id) => document.getElementById(id);

let encoderPromise = null;
function encoder() {
  encoderPromise ||= import('./vendor/tiktoken-o200k.js').then(({ Tiktoken, o200k_base }) => new Tiktoken(o200k_base));
  return encoderPromise;
}

export async function countTokens(text) {
  if (!text) return 0;
  return (await encoder()).encode(text).length;
}

// Approximation of a whole request: instructions + every message + a few
// formatting tokens each. Used only when no provider count exists.
export async function countConversation(system, messages) {
  let n = (await countTokens(system)) + 4;
  for (const m of messages) n += (await countTokens(m.content)) + 4;
  return n;
}

/** Split text into token strings. Characters split across tokens (some
 *  emoji, accented letters) are merged into one piece so nothing shows as "�". */
async function split(text) {
  const enc = await encoder();
  const ids = enc.encode(text);
  const pieces = [];
  let pending = [];
  for (const id of ids) {
    pending.push(id);
    const s = enc.decode(pending);
    if (s.includes('�') && pending.length < 4) continue;
    pieces.push(s);
    pending = [];
  }
  if (pending.length) pieces.push(enc.decode(pending));
  return pieces;
}

// One token as a stamped unit; spaces become a faint middle dot.
function pill(piece) {
  const span = document.createElement('span');
  span.className = 'token-pill';
  for (const part of piece.split(/( |\n)/)) {
    if (part === ' ') {
      const dot = document.createElement('span');
      dot.className = 'token-space';
      dot.textContent = '·';
      dot.setAttribute('aria-hidden', 'true');
      span.append(dot);
    } else if (part === '\n') {
      const mark = document.createElement('span');
      mark.className = 'token-space';
      mark.textContent = '↵';
      mark.setAttribute('aria-hidden', 'true');
      span.append(mark);
    } else if (part) {
      span.append(part);
    }
  }
  return span;
}

async function group(label, text) {
  const wrap = document.createElement('div');
  wrap.className = 'token-group';
  const head = document.createElement('span');
  head.className = 'token-group-label';
  head.textContent = label;
  const body = document.createElement('div');
  const pieces = await split(text);
  const frag = document.createDocumentFragment();
  for (const p of pieces) {
    frag.append(pill(p));
    if (p.includes('\n')) frag.append(document.createElement('br')); // keep the answer's line breaks
  }
  body.append(frag);
  wrap.append(head, body);
  return { el: wrap, count: pieces.length };
}

let renderVersion = 0;

/** Render all turns: visitor messages, answers, counts and the register. */
export async function renderTokens(turns) {
  const version = ++renderVersion;
  $('token-explainer').innerHTML = TEXT.tokenExplainer;

  const inBox = $('input-tokens-visual');
  const outBox = $('output-tokens-visual');
  const inFrag = document.createDocumentFragment();
  const outFrag = document.createDocumentFragment();
  const typed = [];

  for (const t of turns) {
    const q = await group('', t.question);
    typed.push(q.count);
    q.el.firstChild.textContent = `Question ${t.number} · ${int(q.count)} pieces typed`;
    inFrag.append(q.el);

    const a = await group('', t.answer || ' ');
    const hidden = t.thinking ? ` · includes ${int(t.thinking)} hidden thinking tokens` : '';
    a.el.firstChild.textContent = `Answer ${t.number} · ${int(t.output)} tokens${hidden}`;
    outFrag.append(a.el);
  }
  if (version !== renderVersion) return; // a newer render (or a reset) started

  inBox.replaceChildren(inFrag);
  outBox.replaceChildren(outFrag);
  inBox.scrollTop = inBox.scrollHeight;
  outBox.scrollTop = outBox.scrollHeight;

  const totalIn = turns.reduce((s, t) => s + t.input, 0);
  const totalOut = turns.reduce((s, t) => s + t.output, 0);
  $('input-token-count').textContent = int(totalIn);
  $('output-token-count').textContent = int(totalOut);

  // How honest is the split?
  const anySample = turns.some((t) => !t.live);
  const allSample = turns.every((t) => !t.live);
  let note = CONFIG.provider === 'openai' ? TEXT.splitExact : TEXT.splitApprox;
  if (allSample) note = TEXT.splitSample;
  else if (anySample) note += ' Sample answers (marked †) are counted on this computer, not by an AI provider.';
  $('split-note').textContent = note;

  renderRegister(turns, typed);
}

function renderRegister(turns, typed) {
  const table = $('token-register');
  const body = table.tBodies[0];
  body.replaceChildren();
  let running = 0;
  let flagged = false;
  for (const t of turns) {
    running += t.input + t.output;
    const mark = !t.live ? ' †' : t.stopped || !t.exact?.output ? ' *' : '';
    if (mark) flagged = true;
    const tr = document.createElement('tr');
    const cells = [`Question ${t.number}${mark}`, int(t.input), int(t.output), int(running)];
    cells.forEach((v, c) => {
      const td = document.createElement('td');
      td.textContent = v;
      if (c > 0) td.className = 'num';
      tr.append(td);
    });
    body.append(tr);
  }

  table.tFoot?.remove();
  const foot = table.createTFoot();
  const tr = foot.insertRow();
  const totalIn = turns.reduce((s, t) => s + t.input, 0);
  const totalOut = turns.reduce((s, t) => s + t.output, 0);
  ['Total', int(totalIn), int(totalOut), int(totalIn + totalOut)].forEach((v, c) => {
    const td = tr.insertCell();
    td.textContent = v;
    if (c > 0) td.className = 'num';
  });

  // The surprising cost driver: follow-ups re-send everything.
  let note = TEXT.resendNote;
  if (turns.length > 1) {
    const last = turns[turns.length - 1];
    const lastTyped = typed[typed.length - 1];
    note += ` Your question ${last.number} was about ${int(lastTyped)} tokens long, but ${int(last.input)} tokens were sent.`;
  } else if (turns.length === 1) {
    note += ` “Sent” also includes the exhibit’s short hidden instructions to the AI.`;
  }
  $('resend-note').textContent = note;

  const notes = [];
  if (turns.some((t) => !t.live)) notes.push('† Sample answer: tokens counted on this computer.');
  if (turns.some((t) => t.live && (t.stopped || !t.exact?.output)))
    notes.push('* Stopped early: tokens written were counted on this computer.');
  $('register-footnote').textContent = flagged ? notes.join(' ') : 'All counts reported by the AI provider.';
}

export function clearTokens() {
  renderVersion++;
  $('input-tokens-visual').replaceChildren();
  $('output-tokens-visual').replaceChildren();
  $('input-token-count').textContent = '0';
  $('output-token-count').textContent = '0';
  $('token-register').tBodies[0].replaceChildren();
  $('token-register').tFoot?.remove();
  $('resend-note').textContent = '';
  $('register-footnote').textContent = '';
  $('split-note').textContent = '';
}

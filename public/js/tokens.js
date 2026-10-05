// How the AI reads your text: the tokens. Counts always come from the AI provider's usage data.
// The visual split into pieces uses OpenAI's o200k tokenizer, bundled
// locally: exact for OpenAI models, an honest approximation for others.
import { CONFIG } from './config.js';
import { TEXT, TOKEN_EXAMPLES } from './content.js';
import { int } from './format.js';
import { t, pick } from './i18n.js';

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

// A token that starts with a vowel sign or virama (common in Nepali) belongs
// to the letter before it. Pieces are inline so the browser can still join
// the letters across them; line breaks are offered only before a piece that
// starts a new letter, never inside one.
const JOINS_PREVIOUS = /^[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963\u200C\u200D]/;

function pieces(list) {
  const frag = document.createDocumentFragment();
  list.forEach((p, i) => {
    if (i > 0 && !JOINS_PREVIOUS.test(p)) frag.append(document.createElement('wbr'));
    frag.append(pill(p));
    if (p.includes('\n')) frag.append(document.createElement('br')); // keep the answer's line breaks
  });
  return frag;
}

async function group(label, text) {
  const wrap = document.createElement('div');
  wrap.className = 'token-group';
  const head = document.createElement('span');
  head.className = 'token-group-label';
  head.textContent = label;
  const body = document.createElement('div');
  const list = await split(text);
  body.append(pieces(list));
  wrap.append(head, body);
  return { el: wrap, count: list.length };
}

let renderVersion = 0;

// The lesson: one sentence in English and in Nepali, cut into tokens.
async function renderExamples() {
  for (const lang of ['en', 'ne']) {
    const list = await split(TOKEN_EXAMPLES[lang]);
    $(`token-example-${lang}`).replaceChildren(pieces(list));
    $(`token-example-${lang}-count`).textContent = t('nTokens', { c: int(list.length) });
  }
}

/** Render the lesson, then every turn: what was sent, what was written. */
export async function renderTokens(turns) {
  const version = ++renderVersion;
  await renderExamples();

  const inBox = $('input-tokens-visual');
  const outBox = $('output-tokens-visual');
  const inFrag = document.createDocumentFragment();
  const outFrag = document.createDocumentFragment();
  let totalTyped = 0;

  // The note the exhibit sends before every question, shown so nobody has
  // to wonder what the extra tokens are.
  const note = await group('', CONFIG.systemPrompt);
  note.el.classList.add('token-group--note');
  note.el.firstChild.textContent = t('hiddenNote', { c: int(note.count) });
  note.el.lang = 'en';
  inFrag.append(note.el);

  for (const turn of turns) {
    const q = await group('', turn.question);
    totalTyped += q.count;
    q.el.firstChild.textContent = t('groupQ', { n: int(turn.number), c: int(q.count) });
    inFrag.append(q.el);

    const a = await group('', turn.answer || ' ');
    const hidden = turn.thinking ? t('hiddenThinking', { c: int(turn.thinking) }) : '';
    a.el.firstChild.textContent = t('groupA', { n: int(turn.number), c: int(turn.output) }) + hidden;
    outFrag.append(a.el);
  }
  if (version !== renderVersion) return; // a newer render (or a reset) started

  inBox.replaceChildren(inFrag);
  outBox.replaceChildren(outFrag);
  inBox.scrollTop = inBox.scrollHeight;
  outBox.scrollTop = outBox.scrollHeight;

  const totalIn = turns.reduce((sum, x) => sum + x.input, 0);
  const totalOut = turns.reduce((sum, x) => sum + x.output, 0);
  $('input-token-count').textContent = int(totalIn);
  $('output-token-count').textContent = int(totalOut);
  // Why "sent" is more than what was typed: the hidden note + earlier messages.
  $('input-breakdown').textContent = t('breakdown', { typed: int(totalTyped), rest: int(Math.max(0, totalIn - totalTyped)) });

  // How honest is the split?
  const anySample = turns.some((x) => !x.live);
  const allSample = turns.every((x) => !x.live);
  let splitNote = pick(CONFIG.provider === 'openai' ? TEXT.splitExact : TEXT.splitApprox);
  if (allSample) splitNote = pick(TEXT.splitSample);
  else if (anySample) splitNote += ` ${t('footSample')}`;
  $('split-note').textContent = splitNote;
}

export function clearTokens() {
  renderVersion++;
  $('input-tokens-visual').replaceChildren();
  $('output-tokens-visual').replaceChildren();
  $('input-token-count').textContent = '0';
  $('input-breakdown').textContent = '';
  $('output-token-count').textContent = '0';
  $('split-note').textContent = '';
}

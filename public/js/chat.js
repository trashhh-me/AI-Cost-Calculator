// Part 1: the chat. A familiar AI chat screen that streams real answers
// from the local server, with designed states for everything that can
// happen at a kiosk: empty prompt, waiting, streaming, stopped, errors,
// sample answers and the per-visit question limit.
import { CONFIG } from './config.js';
import { PRESETS, sampleAnswerFor } from './demo-answers.js';
import { renderMarkdown, plainText } from './markdown.js';
import { int, str, energy } from './format.js';
import { countTokens, countConversation } from './tokens.js';

const $ = (id) => document.getElementById(id);

// Plain, calm wording for every reason an answer is a sample.
const SAMPLE_REASONS = {
  demo: 'This exhibit is running on pre-written sample answers.',
  nokey: 'This exhibit is running on pre-written sample answers.',
  network: 'The live AI could not be reached, so this is a pre-written sample answer.',
  offline: 'The exhibit could not reach its server, so this is a pre-written sample answer.',
  rate: 'The live AI is busy right now, so this is a pre-written sample answer.',
  credit: 'The live AI is not available right now, so this is a pre-written sample answer.',
  auth: 'The live AI is not available right now, so this is a pre-written sample answer.',
  cap: 'Today’s budget for live answers has been used up, so the exhibit is showing pre-written sample answers. Live answers return tomorrow.',
  error: 'Something went wrong with the live AI, so this is a pre-written sample answer.',
};

export function createChat({ getVisitId, onTurnComplete, onActivity }) {
  const app = $('chat-app');
  const form = $('prompt-box');
  const input = $('user-prompt');
  const sendBtn = $('submit-prompt');
  const stopBtn = $('stop-btn');
  const notice = $('chat-notice');
  const list = $('conversation');
  const scroller = $('Chat-Page');
  const charCount = $('char-count');
  const questionsLeft = $('questions-left');
  const modelStatus = $('model-status');
  const modelName = $('model-name');
  const statusDot = document.querySelector('.status-dot');
  const announcer = $('answer-announcer');
  const seeCostBtn = $('see-cost-btn');

  const maxChars = CONFIG.limits.maxPromptChars;
  input.maxLength = maxChars;

  let messages = []; // what is sent to the server: [{ role, content }]
  let remaining = CONFIG.limits.maxQuestionsPerVisit;
  let busy = false;
  let current = null; // the answer currently streaming
  let modelLabel = CONFIG.modelLabels[CONFIG.models[CONFIG.provider]] || CONFIG.models[CONFIG.provider];
  let turnNumber = 0;

  /* ---------- Suggestions ---------- */
  const presetBox = $('presets');
  for (const p of PRESETS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset-btn';
    b.innerHTML = '<span class="preset-hint"></span><span class="preset-label"></span>';
    b.querySelector('.preset-hint').textContent = p.hint;
    b.querySelector('.preset-label').textContent = p.label;
    b.addEventListener('click', () => send(p.prompt));
    presetBox.append(b);
  }

  /* ---------- Composer ---------- */
  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }

  function updateCharCount() {
    const n = input.value.length;
    const near = n >= maxChars * 0.8;
    charCount.dataset.near = String(n >= maxChars * 0.95);
    charCount.textContent = near
      ? n >= maxChars
        ? `${int(n)} / ${int(maxChars)}: that’s the limit`
        : `${int(n)} / ${int(maxChars)} characters`
      : '';
  }

  input.addEventListener('input', () => {
    autoGrow();
    updateCharCount();
    if (input.value.trim()) {
      input.removeAttribute('aria-invalid');
      if (notice.dataset.kind === 'empty') hideNotice();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send(input.value);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

  stopBtn.addEventListener('click', stop);

  seeCostBtn.addEventListener('click', () => {
    $('Tokenization').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    $('tokens-heading').setAttribute('tabindex', '-1');
    $('tokens-heading').focus({ preventScroll: true });
  });

  function showNotice(text, kind = 'info') {
    notice.textContent = text;
    notice.dataset.kind = kind;
    notice.hidden = false;
  }
  function hideNotice() {
    notice.hidden = true;
    notice.textContent = '';
    delete notice.dataset.kind;
  }

  function setBusy(on) {
    busy = on;
    sendBtn.disabled = on || remaining <= 0;
    input.disabled = remaining <= 0;
    stopBtn.hidden = !on;
    sendBtn.hidden = on;
  }

  function updateQuestionsLeft() {
    questionsLeft.textContent =
      remaining <= 0 ? 'No questions left' : `${remaining} question${remaining === 1 ? '' : 's'} left`;
  }

  /* ---------- Status from the server ---------- */
  async function refreshStatus() {
    try {
      const r = await fetch(`/api/status?visit=${encodeURIComponent(getVisitId())}`, { cache: 'no-store' });
      const s = await r.json();
      modelLabel = s.modelLabel;
      modelName.textContent = s.modelLabel;
      setLive(s.live, s.reason);
      remaining = s.remaining;
    } catch {
      modelName.textContent = modelLabel;
      setLive(false, 'offline');
    }
    updateQuestionsLeft();
    setBusy(false);
  }

  function setLive(live, reason) {
    statusDot.dataset.state = live ? 'live' : 'sample';
    modelStatus.textContent = live ? 'Live answers' : reason === 'cap' ? 'Sample answers (today’s budget used)' : 'Sample answers';
  }

  /* ---------- Messages ---------- */
  function scrollToEnd(force = false) {
    const nearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;
    if (force || nearBottom) scroller.scrollTop = scroller.scrollHeight;
  }

  function addVisitorMessage(text) {
    const el = document.createElement('div');
    el.className = 'message message--visitor';
    el.textContent = text;
    list.append(el);
  }

  function addAnswerShell() {
    const el = document.createElement('article');
    el.className = 'message message--ai is-streaming';
    el.setAttribute('aria-label', `Answer ${turnNumber}`);
    el.innerHTML = `
      <p class="message-meta"><span class="answer-from"></span></p>
      <p class="message-note" hidden></p>
      <p class="thinking">Reading your question… <span class="thinking-time">0.0</span> s</p>
      <div class="answer-body"></div>`;
    el.querySelector('.answer-from').textContent = modelLabel;
    list.append(el);
    return el;
  }

  function markSample(el, reason) {
    const meta = el.querySelector('.message-meta');
    if (!meta.querySelector('.sample-tag')) {
      const tag = document.createElement('span');
      tag.className = 'sample-tag';
      tag.textContent = 'Sample answer';
      meta.prepend(tag);
    }
    const note = el.querySelector('.message-note');
    note.textContent = SAMPLE_REASONS[reason] || SAMPLE_REASONS.error;
    note.hidden = false;
  }

  /* ---------- Sending ---------- */
  async function send(raw) {
    if (busy) return;
    onActivity?.();
    const text = (raw || '').trim();
    if (!text) {
      input.setAttribute('aria-invalid', 'true');
      showNotice('Type a question first, or tap one of the suggestions below.', 'empty');
      input.focus();
      return;
    }
    if (remaining <= 0) {
      showNotice('That was your last question for this visit. Scroll down to see what the conversation cost.', 'warning');
      return;
    }
    if (text.length > maxChars) {
      showNotice(`Please keep your question under ${int(maxChars)} characters.`, 'warning');
      return;
    }

    hideNotice();
    input.removeAttribute('aria-invalid');
    app.dataset.state = 'chat';
    input.value = '';
    autoGrow();
    updateCharCount();
    turnNumber += 1;
    addVisitorMessage(text);
    const el = addAnswerShell();
    scrollToEnd(true);

    const payload = [...messages, { role: 'user', content: text }];
    const c = (current = {
      el,
      text: '',
      requestId: null,
      live: true,
      reason: null,
      stopped: false,
      usage: null,
      controller: new AbortController(),
      started: performance.now(),
      firstDelta: false,
    });
    setBusy(true);
    const timer = setInterval(() => {
      const t = el.querySelector('.thinking-time');
      if (t) t.textContent = ((performance.now() - c.started) / 1000).toFixed(1);
    }, 100);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId: getVisitId(), messages: payload }),
        signal: c.controller.signal,
      });
      if (res.status === 429) {
        // The server says this visit has used its questions.
        el.remove();
        list.lastElementChild?.remove();
        turnNumber -= 1;
        remaining = 0;
        current = null;
        updateQuestionsLeft();
        setBusy(false);
        showNotice('That was your last question for this visit. Scroll down to see what the conversation cost.', 'warning');
        return;
      }
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      await readStream(res.body);
    } catch {
      if (current !== c) return; // the page was reset for a new visitor
      if (!c.usage) {
        if (c.stopped) {
          c.usage = await localUsage(payload, c.text, c.live);
        } else {
          // The local server itself could not be reached: answer from the
          // sample answers bundled with the page, so the screen is never dead.
          await localSample(text, payload);
        }
      }
    } finally {
      clearInterval(timer);
    }

    if (current === c) finishTurn(text);
  }

  // Token counts made in the browser, when no server reported them.
  async function localUsage(payload, answer, live = false) {
    return {
      type: 'usage',
      live,
      sample: !live,
      input: await countConversation(CONFIG.systemPrompt, payload),
      output: await countTokens(answer),
      thinking: 0,
      exact: { input: false, output: false },
      model: CONFIG.models[CONFIG.provider],
      costUSD: null,
      priceModel: CONFIG.models[CONFIG.provider],
    };
  }

  async function readStream(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line) handleEvent(JSON.parse(line));
      }
    }
  }

  function handleEvent(ev) {
    const c = current;
    if (!c) return;
    switch (ev.type) {
      case 'meta':
        c.requestId = ev.requestId;
        c.live = ev.live;
        c.reason = ev.reason;
        if (ev.modelLabel) {
          modelLabel = ev.modelLabel;
          c.el.querySelector('.answer-from').textContent = ev.modelLabel;
        }
        if (!ev.live) markSample(c.el, ev.reason);
        setLive(ev.live, ev.reason);
        break;
      case 'fallback':
        // The live answer failed part-way: replace it with a labelled sample.
        c.live = false;
        c.reason = ev.reason;
        c.text = '';
        markSample(c.el, ev.reason);
        renderAnswer();
        setLive(false, ev.reason);
        break;
      case 'delta':
        if (!c.firstDelta) {
          c.firstDelta = true;
          c.el.querySelector('.thinking')?.remove();
        }
        c.text += ev.text;
        scheduleRender();
        break;
      case 'usage':
        c.usage = ev;
        break;
      case 'done':
        remaining = ev.remaining;
        if (ev.capReached) setLive(false, 'cap');
        break;
    }
  }

  let renderQueued = false;
  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderAnswer();
      scrollToEnd();
    });
  }
  function renderAnswer() {
    if (!current) return;
    current.el.querySelector('.answer-body').innerHTML = renderMarkdown(current.text);
  }

  // Last resort if the local server is down: stream a bundled sample.
  async function localSample(question, payload) {
    const c = current;
    c.live = false;
    c.reason = 'offline';
    markSample(c.el, 'offline');
    setLive(false, 'offline');
    const answer = sampleAnswerFor(question);
    const pieces = answer.match(/\S+\s*/g) || [];
    await new Promise((r) => setTimeout(r, 600));
    c.el.querySelector('.thinking')?.remove();
    for (const p of pieces) {
      if (c.stopped || c.controller.signal.aborted) break;
      c.text += p;
      scheduleRender();
      await new Promise((r) => setTimeout(r, 25));
    }
    c.usage = await localUsage(payload, c.text, false);
    remaining = Math.max(0, remaining - 1);
  }

  async function stop() {
    if (!current || current.stopped) return;
    current.stopped = true;
    stopBtn.disabled = true;
    if (current.requestId) {
      try {
        await fetch('/api/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: current.requestId }),
        });
      } catch {
        current?.controller.abort();
      }
    } else {
      // Stopped before the server answered: closing the request stops it.
      current.controller.abort();
    }
    stopBtn.disabled = false;
  }

  function finishTurn(question) {
    const c = current;
    current = null;
    renderQueued = false;
    c.el.classList.remove('is-streaming');
    c.el.querySelector('.thinking')?.remove();
    c.el.querySelector('.answer-body').innerHTML = renderMarkdown(c.text);

    const usage = c.usage || {
      input: 0,
      output: 0,
      exact: { input: false, output: false },
      live: false,
      costUSD: null,
      priceModel: CONFIG.models[CONFIG.provider],
    };
    if (c.stopped) {
      const note = document.createElement('p');
      note.className = 'stopped-note';
      note.textContent = 'Stopped. The tokens written up to this point still count.';
      c.el.append(note);
    }

    // Meter line: ties this answer to the cost story further down
    const wh = usage.input * CONFIG.energy.inputWhPerToken + usage.output * CONFIG.energy.outputWhPerToken;
    const meter = document.createElement('p');
    meter.className = 'meter-line';
    meter.innerHTML = `<span><strong></strong> tokens sent</span><span><strong></strong> tokens written</span><span>~<strong></strong> electricity</span>`;
    const [a, b, d] = meter.querySelectorAll('strong');
    a.textContent = int(usage.input);
    b.textContent = int(usage.output);
    d.textContent = formatWh(wh);
    c.el.append(meter);

    announcer.textContent = `Answer complete. ${plainText(c.text)}`;

    messages.push({ role: 'user', content: question });
    messages.push({ role: 'assistant', content: c.text.trim() || '(The visitor stopped this answer before it began.)' });

    updateQuestionsLeft();
    setBusy(false);
    seeCostBtn.hidden = false;
    if (remaining <= 0) {
      showNotice('That was your last question for this visit. Scroll down to see what the conversation cost.', 'info');
    } else {
      input.focus({ preventScroll: true });
    }
    scrollToEnd(true);

    onTurnComplete({
      number: turnNumber,
      question,
      answer: c.text,
      input: usage.input,
      output: usage.output,
      thinking: usage.thinking || 0,
      exact: usage.exact,
      live: !!usage.live,
      reason: c.reason,
      stopped: c.stopped,
      costUSD: usage.costUSD,
      priceModel: usage.priceModel,
      model: usage.model,
      modelLabel,
    });
  }

  function formatWh(wh) {
    return str(energy(wh), 2);
  }

  /* ---------- Reset (new visitor) ---------- */
  function reset() {
    if (current) {
      current.controller.abort();
      if (current.requestId) {
        fetch('/api/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: current.requestId }),
        }).catch(() => {});
      }
      current = null;
    }
    messages = [];
    turnNumber = 0;
    list.replaceChildren();
    announcer.textContent = '';
    input.value = '';
    input.removeAttribute('aria-invalid');
    autoGrow();
    updateCharCount();
    hideNotice();
    seeCostBtn.hidden = true;
    app.dataset.state = 'start';
    remaining = CONFIG.limits.maxQuestionsPerVisit;
    updateQuestionsLeft();
    setBusy(false);
    return refreshStatus();
  }

  function hasContent() {
    return messages.length > 0 || !!current || input.value.length > 0;
  }

  updateQuestionsLeft();
  refreshStatus();

  return { reset, hasContent, focus: () => input.focus() };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

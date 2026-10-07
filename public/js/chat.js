// The chat. A familiar AI chat screen that streams real answers from the
// local server, with designed states for everything that can happen at a
// kiosk: empty prompt, waiting, streaming, stopped, errors, sample answers
// and the per-visit question limit. Finished turns are kept for the visit
// (store.js) for the bill and the explanations below the chat.
import { CONFIG } from './config.js';
import { PRESETS, sampleAnswerFor } from './demo-answers.js';
import { renderMarkdown, plainText } from './markdown.js';
import { int, str, energy, seconds } from './format.js';
import { countTokens, countConversation } from './tokens.js';
import { t, pick, onLangChange } from './i18n.js';
import { getVisit, addTurn, setRemaining } from './store.js';

const $ = (id) => document.getElementById(id);

// Stand-in for an answer stopped before its first word, so the conversation
// sent to the AI stays well formed. Never shown.
const EMPTY_ANSWER = '(The visitor stopped this answer before it began.)';

export function createChat({ onActivity, onTurnComplete }) {
  const app = $('chat-app');
  const form = $('prompt-box');
  const input = $('user-prompt');
  const sendBtn = $('submit-prompt');
  const stopBtn = $('stop-btn');
  const notice = $('chat-notice');
  const list = $('conversation');
  const scroller = $('Chat-Page');
  const charCount = $('char-count');
  const announcer = $('answer-announcer');
  const seeCost = $('see-cost');
  const templates = $('templates');
  const presetBox = $('presets');

  const maxChars = CONFIG.limits.maxPromptChars;
  input.maxLength = maxChars;

  let remaining = getVisit().remaining;
  let busy = false;
  let current = null; // the answer currently streaming
  let modelLabel = CONFIG.modelLabels[CONFIG.models[CONFIG.provider]] || CONFIG.models[CONFIG.provider];
  let live = null; // null until the server has said
  let noticeState = null; // { key, vars, kind }, so it can be re-said in another language

  const turns = () => getVisit().turns;

  /* ---------- Template prompts ---------- */
  // Choosing one fills the box (the visitor can still edit it) and closes
  // the list; it is not sent until they press Send.
  function renderPresets() {
    presetBox.replaceChildren();
    for (const p of PRESETS) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'preset-btn';
      b.innerHTML = '<span class="preset-text"></span><span class="preset-kind"></span>';
      b.querySelector('.preset-text').textContent = pick(p.prompt);
      b.querySelector('.preset-kind').textContent = pick(p.kind);
      b.addEventListener('click', () => {
        input.value = pick(p.prompt);
        templates.open = false;
        autoGrow();
        updateCharCount();
        hideNotice();
        input.removeAttribute('aria-invalid');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      });
      li.append(b);
      presetBox.append(li);
    }
  }
  // Close the list when tapping elsewhere or pressing Escape.
  document.addEventListener('click', (e) => {
    if (templates.open && !templates.contains(e.target)) templates.open = false;
  });
  templates.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && templates.open) {
      templates.open = false;
      templates.querySelector('summary').focus();
    }
  });

  /* ---------- Composer ---------- */
  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }

  function updateCharCount() {
    const n = input.value.length;
    const near = n >= maxChars * 0.8;
    charCount.dataset.near = String(n >= maxChars * 0.95);
    charCount.textContent = near ? `${int(n)} / ${int(maxChars)}` : '';
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

  function showNotice(key, vars = {}, kind = 'info') {
    noticeState = { key, vars, kind };
    notice.textContent = t(key, vars);
    notice.dataset.kind = kind;
    notice.hidden = false;
  }
  function hideNotice() {
    noticeState = null;
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

  function allUsedNotice() {
    showNotice('allUsed', { n: int(CONFIG.limits.maxQuestionsPerVisit) }, 'info');
  }

  /* ---------- Status from the server ---------- */
  async function refreshStatus() {
    try {
      const r = await fetch(`/api/status?visit=${encodeURIComponent(getVisit().visitId)}`, { cache: 'no-store' });
      const s = await r.json();
      modelLabel = s.modelLabel;
      setLive(s.live);
      remaining = s.remaining;
      setRemaining(remaining);
    } catch {
      // No server (offline, or a static copy of the exhibit): sample answers,
      // counting questions on this page.
      setLive(false);
    }
    setBusy(false);
    if (remaining <= 0 && turns().length) allUsedNotice();
  }

  function setLive(isLive) {
    live = isLive;
  }

  /* ---------- Messages ---------- */
  function scrollToEnd(force = false) {
    // Large screens scroll the conversation box; small screens scroll the page.
    if (getComputedStyle(scroller).overflowY === 'visible') {
      const last = list.lastElementChild;
      if (!last) return;
      const nearBottom = last.getBoundingClientRect().bottom - window.innerHeight < 200;
      if (force || nearBottom) last.scrollIntoView({ block: 'end' });
      return;
    }
    const nearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;
    if (force || nearBottom) scroller.scrollTop = scroller.scrollHeight;
  }

  function addVisitorMessage(text) {
    const el = document.createElement('div');
    el.className = 'message message--visitor';
    el.textContent = text;
    list.append(el);
  }

  // Each answer is headed, quietly, with the model that wrote it.
  function addAnswerShell(n, label = modelLabel) {
    const el = document.createElement('article');
    el.className = 'message message--ai is-streaming';
    el.setAttribute('aria-label', t('answerN', { n: int(n) }));
    el.innerHTML = `
      <p class="answer-from"></p>
      <p class="thinking"></p>
      <div class="answer-body"></div>`;
    el.querySelector('.answer-from').textContent = label;
    list.append(el);
    return el;
  }

  // The finishing touches under an answer: stopped note and the meter line.
  function finishAnswerEl(el, turn) {
    el.classList.remove('is-streaming');
    el.querySelector('.thinking')?.remove();
    if (turn.stopped) {
      const note = document.createElement('p');
      note.className = 'stopped-note';
      note.textContent = t('stopped');
      el.append(note);
    }
    // Meter line: ties this answer to the cost page
    const wh = turn.input * CONFIG.energy.inputWhPerToken + turn.output * CONFIG.energy.outputWhPerToken;
    const meter = document.createElement('p');
    meter.className = 'meter-line';
    meter.innerHTML = `<span>${t('meter', { in: int(turn.input), out: int(turn.output) })}</span><span>~<strong></strong></span>`;
    meter.querySelector('span:last-child strong').textContent = str(energy(wh), 2);
    el.append(meter);
  }

  /** Show every finished turn of this visit (after coming back, or a language change). */
  function renderHistory() {
    list.replaceChildren();
    for (const turn of turns()) {
      addVisitorMessage(turn.question);
      const el = addAnswerShell(turn.number, turn.modelLabel || modelLabel);
      el.querySelector('.answer-body').innerHTML = renderMarkdown(turn.answer);
      finishAnswerEl(el, turn);
    }
    const any = turns().length > 0;
    app.dataset.state = any ? 'chat' : 'start';
    seeCost.hidden = !any;
  }

  /* ---------- Sending ---------- */
  async function send(raw) {
    if (busy) return;
    onActivity?.();
    const text = (raw || '').trim();
    if (!text) {
      input.setAttribute('aria-invalid', 'true');
      showNotice('typeFirst', {}, 'empty');
      input.focus();
      return;
    }
    if (remaining <= 0) {
      allUsedNotice();
      return;
    }
    if (text.length > maxChars) {
      showNotice('tooLong', { n: int(maxChars) }, 'warning');
      return;
    }

    hideNotice();
    input.removeAttribute('aria-invalid');
    app.dataset.state = 'chat';
    input.value = '';
    autoGrow();
    updateCharCount();
    const number = turns().length + 1;
    addVisitorMessage(text);
    const el = addAnswerShell(number);
    scrollToEnd(true);

    // Everything said so far, then the new question.
    const history = turns().flatMap((tn) => [
      { role: 'user', content: tn.question },
      { role: 'assistant', content: tn.answer.trim() || EMPTY_ANSWER },
    ]);
    const payload = [...history, { role: 'user', content: text }];
    const c = (current = {
      el,
      number,
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
    const tick = () => {
      const p = el.querySelector('.thinking');
      if (p) p.textContent = t('thinking', { s: seconds((performance.now() - c.started) / 1000) });
    };
    tick();
    const timer = setInterval(tick, 100);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId: getVisit().visitId, messages: payload }),
        signal: c.controller.signal,
      });
      if (res.status === 429) {
        // The server says this visit has used its questions.
        el.remove();
        list.lastElementChild?.remove();
        remaining = 0;
        setRemaining(0);
        current = null;
        setBusy(false);
        allUsedNotice();
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
          // The server itself could not be reached: answer from the sample
          // answers bundled with the page, so the screen is never dead.
          await localSample(text, payload);
        }
      }
    } finally {
      clearInterval(timer);
    }

    if (current === c) finishTurn(text);
  }

  // Token counts made in the browser, when no server reported them.
  async function localUsage(payload, answer, isLive = false) {
    return {
      type: 'usage',
      live: isLive,
      sample: !isLive,
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
          c.el.querySelector('.answer-from').textContent = modelLabel;
        }
        setLive(ev.live);
        break;
      case 'fallback':
        // The live answer failed part-way: replace it with a labelled sample.
        c.live = false;
        c.reason = ev.reason;
        c.text = '';
        renderAnswer();
        setLive(false);
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
        if (ev.capReached) setLive(false);
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

  // Last resort if the server is down: stream a bundled sample.
  async function localSample(question, payload) {
    const c = current;
    c.live = false;
    c.reason = 'offline';
    setLive(false);
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
    c.el.querySelector('.answer-body').innerHTML = renderMarkdown(c.text);

    const usage = c.usage || {
      input: 0,
      output: 0,
      exact: { input: false, output: false },
      live: false,
      costUSD: null,
      priceModel: CONFIG.models[CONFIG.provider],
    };
    const turn = {
      number: c.number,
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
    };
    finishAnswerEl(c.el, turn);
    addTurn(turn, remaining);
    onTurnComplete?.(turn);

    announcer.textContent = `${t('answerComplete')} ${plainText(c.text)}`;
    setBusy(false);
    seeCost.hidden = false;
    if (remaining <= 0) allUsedNotice();
    else input.focus({ preventScroll: true });
    scrollToEnd(true);
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
    list.replaceChildren();
    announcer.textContent = '';
    input.value = '';
    input.removeAttribute('aria-invalid');
    templates.open = false;
    autoGrow();
    updateCharCount();
    hideNotice();
    seeCost.hidden = true;
    app.dataset.state = 'start';
    remaining = getVisit().remaining;
    setBusy(false);
    return refreshStatus();
  }

  function hasContent() {
    return turns().length > 0 || !!current || input.value.length > 0;
  }

  // Another language: everything this file wrote is written again.
  onLangChange(() => {
    renderPresets();
    if (live !== null) setLive(live);
    if (noticeState) showNotice(noticeState.key, noticeState.vars, noticeState.kind);
    if (!busy) renderHistory();
  });

  renderPresets();
  renderHistory();
  refreshStatus();
  if (turns().length) scrollToEnd(true);

  return { reset, hasContent, isBusy: () => busy, focus: () => input.focus() };
}

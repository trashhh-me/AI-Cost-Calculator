// AI Cost Calculator: one page. The question box and the answer; after the
// first answer, "See the Cost of Your Query" opens the bill (a printed
// receipt) and "How do we estimate this?", whose parts open one at a
// time. Plus the language and text-size switches and the kiosk idle reset.
import { createChat } from './chat.js';
import { renderTokens, clearTokens } from './tokens.js';
import { fillExplainer } from './explainer.js';
import { renderReceipt, initPrinting, clearReceipt } from './bill.js';
import { calculate } from './calculate.js';
import { initKiosk } from './kiosk.js';
import { initControls, onLangChange, resetLang, resetTextSize, getLang } from './i18n.js';
import { getVisit, clearVisit } from './store.js';

const $ = (id) => document.getElementById(id);
const costBar = $('see-cost');
const costContent = $('cost-content');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Whether the cost part is open, kept for the visit (e.g. after References).
const OPEN_KEY = 'aidex-cost-open';
const store = {
  get: (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      if (v === null) sessionStorage.removeItem(k);
      else sessionStorage.setItem(k, v);
    } catch {
      /* fine */
    }
  },
};

function setOpen(open) {
  costContent.hidden = !open;
  costBar.setAttribute('aria-expanded', String(open));
  store.set(OPEN_KEY, open ? '1' : null);
}

let chat = null;
// No language switch mid-answer: the answer being written would be cut off.
initControls({ canSwitch: () => !chat?.isBusy() });
initPrinting();

/** The bill and the estimates, from the visit's finished turns. */
function renderCost() {
  const { turns, remaining } = getVisit();
  costBar.hidden = turns.length === 0;
  if (!turns.length) {
    setOpen(false);
    return;
  }
  const result = calculate(turns);
  renderReceipt(turns, result);
  fillExplainer(result);
  $('ask-another').hidden = remaining <= 0;
  $('bill-ask').hidden = remaining <= 0;
  return renderTokens(turns);
}

chat = createChat({
  onActivity: () => kiosk?.activity(),
  onTurnComplete: renderCost,
});

costBar.addEventListener('click', () => {
  const open = costContent.hidden;
  setOpen(open);
  if (open) {
    $('bill').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    $('bill').focus({ preventScroll: true });
  }
});

// Coming back from the References page: same place, same parts open.
const SCROLL_KEY = 'aidex-scroll';
history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => store.set(SCROLL_KEY, String(window.scrollY)));

Promise.resolve(renderCost()).then(() => {
  const hasTurns = getVisit().turns.length > 0;
  const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  if (hasTurns && (store.get(OPEN_KEY) || (target && costContent.contains(target)))) setOpen(true);
  if (target?.tagName === 'DETAILS') target.open = true;
  const y = Number(store.get(SCROLL_KEY)) || 0;
  store.set(SCROLL_KEY, null);
  const go = () => {
    if (target && !costContent.hidden) target.scrollIntoView({ behavior: 'instant' });
    else if (y && hasTurns) window.scrollTo({ top: y, behavior: 'instant' });
  };
  go();
  // Fonts can still change the page height: settle once loaded.
  if (document.readyState === 'complete') requestAnimationFrame(go);
  else window.addEventListener('load', () => requestAnimationFrame(go), { once: true });
});
onLangChange(renderCost);

function askAnother() {
  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  chat.focus();
}
$('ask-another').addEventListener('click', askAnother);
$('bill-ask').addEventListener('click', askAnother);
$('to-estimate').addEventListener('click', () => {
  $('estimate').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
});

// keepSettings: "New chat" keeps the visitor's language and text size;
// the idle reset and "Start again" clear everything for the next visitor.
async function resetAll({ keepSettings = false } = {}) {
  kiosk?.dismiss();
  clearVisit();
  clearTokens();
  clearReceipt();
  setOpen(false);
  for (const d of document.querySelectorAll('.est-block')) d.open = false;
  if (!keepSettings) {
    resetLang();
    resetTextSize();
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (location.hash) history.replaceState(null, '', location.pathname);
  await chat.reset();
}
$('reset-btn').addEventListener('click', () => resetAll());
$('new-chat').addEventListener('click', async () => {
  await resetAll({ keepSettings: true });
  chat.focus();
});

const kiosk = initKiosk({
  // A language or text size left by the last visitor is reset too.
  hasSomethingToClear: () =>
    chat.hasContent() || getLang() !== 'en' || document.documentElement.dataset.textSize === 'large',
  onReset: () => resetAll(),
});

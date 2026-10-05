// AI DEX: one page. The chat at the top; after the first answer, below it:
// the bill, how the AI reads your text, how we estimate each reading, the
// disclaimer and a link to the References page. Plus the language and text-size switches
// and the kiosk idle reset.
import { createChat } from './chat.js';
import { renderTokens, clearTokens } from './tokens.js';
import { buildExplainer, fillExplainer } from './explainer.js';
import { renderReceipt, initPrinting, clearReceipt } from './bill.js';
import { calculate } from './calculate.js';
import { initKiosk } from './kiosk.js';
import { initControls, onLangChange, resetLang, resetTextSize, getLang } from './i18n.js';
import { getVisit, clearVisit } from './store.js';

const $ = (id) => document.getElementById(id);
const costContent = $('cost-content');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let chat = null;
// No language switch mid-answer: the answer being written would be cut off.
initControls({ canSwitch: () => !chat?.isBusy() });
buildExplainer();
initPrinting();

/** Everything below the chat, from the visit's finished turns. */
function renderCost() {
  const { turns, remaining } = getVisit();
  costContent.hidden = turns.length === 0;
  if (!turns.length) return;
  const result = calculate(turns);
  renderReceipt(turns, result);
  fillExplainer(result);
  $('ask-another').hidden = remaining <= 0;
  return renderTokens(turns);
}

chat = createChat({
  onActivity: () => kiosk?.activity(),
  onTurnComplete: renderCost,
});
// Coming back from the References page: return to the same place, once the
// page below the chat has been rebuilt.
const SCROLL_KEY = 'aidex-scroll';
history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  } catch {
    /* fine */
  }
});
Promise.resolve(renderCost()).then(() => {
  let y = 0;
  try {
    y = Number(sessionStorage.getItem(SCROLL_KEY)) || 0;
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {
    /* fine */
  }
  const go = () => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    else if (y && getVisit().turns.length) window.scrollTo({ top: y, behavior: 'instant' });
  };
  go();
  // Photos and fonts can still change the page height: settle once loaded.
  if (document.readyState === 'complete') requestAnimationFrame(go);
  else window.addEventListener('load', () => requestAnimationFrame(go), { once: true });
});
onLangChange(renderCost);

function goTo(id) {
  const el = $(id);
  el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  el.focus({ preventScroll: true });
}

$('see-cost').addEventListener('click', () => goTo('bill'));
$('ask-another').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  chat.focus();
});

async function resetAll() {
  kiosk?.dismiss();
  clearVisit();
  clearTokens();
  clearReceipt();
  costContent.hidden = true;
  resetLang();
  resetTextSize();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (location.hash) history.replaceState(null, '', location.pathname);
  await chat.reset();
}
$('reset-btn').addEventListener('click', resetAll);

const kiosk = initKiosk({
  // A language or text size left by the last visitor is reset too.
  hasSomethingToClear: () =>
    chat.hasContent() || getLang() !== 'en' || document.documentElement.dataset.textSize === 'large',
  onReset: resetAll,
});

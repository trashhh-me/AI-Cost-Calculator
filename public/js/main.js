// AI DEX: one page. The chat at the top; after the first answer, below it:
// the bill, how the AI reads your text, how we estimate each reading, the
// disclaimer and the references. Plus the language and text-size switches
// and the kiosk idle reset.
import { createChat } from './chat.js';
import { renderTokens, clearTokens } from './tokens.js';
import { buildExplainer, fillExplainer, runtimeCitations } from './explainer.js';
import { renderReceipt, initPrinting, clearReceipt } from './bill.js';
import { buildReferences } from './references.js';
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
  renderTokens(turns);
  fillExplainer(result);
  buildReferences(runtimeCitations());
  $('ask-another').hidden = remaining <= 0;
}

chat = createChat({
  onActivity: () => kiosk?.activity(),
  onTurnComplete: renderCost,
});
renderCost();
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

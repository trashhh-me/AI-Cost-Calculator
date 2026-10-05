// AI DEX, the cost page: the bill, how we estimate it (tokens first, then
// one section per reading), the disclaimer and the references. Reads the
// visit the chat page saved; "Ask another question" goes back to it.
import { renderTokens } from './tokens.js';
import { buildExplainer, fillExplainer, runtimeCitations } from './explainer.js';
import { renderReceipt, initPrinting } from './bill.js';
import { buildReferences } from './references.js';
import { calculate } from './calculate.js';
import { initKiosk } from './kiosk.js';
import { initControls, onLangChange, resetLang, resetTextSize } from './i18n.js';
import { getVisit, clearVisit } from './store.js';

const $ = (id) => document.getElementById(id);
const { turns, remaining } = getVisit();

initControls();

function render() {
  const result = calculate(turns);
  renderReceipt(turns, result);
  renderTokens(turns);
  fillExplainer(result);
  buildReferences(runtimeCitations());
}

if (turns.length) {
  buildExplainer();
  render();
  initPrinting();
  onLangChange(render);
  $('ask-another').hidden = remaining <= 0;
  // Arriving from a citation link elsewhere: bring that entry into view.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
} else {
  $('cost-content').hidden = true;
  $('no-visit').hidden = false;
}

// Start again, or the idle reset: forget the visit and go back to the chat.
function startAgain() {
  clearVisit();
  resetLang();
  resetTextSize();
  location.replace('index.html');
}
$('reset-btn').addEventListener('click', startAgain);

initKiosk({
  hasSomethingToClear: () => true, // leaving this page always means a reset
  onReset: startAgain,
});

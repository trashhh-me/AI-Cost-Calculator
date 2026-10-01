// AI DEX: wires the four parts together.
//   chat → tokens → explainer → bill, plus sources, references and the
//   kiosk idle reset.
import { createChat } from './chat.js';
import { renderTokens, clearTokens } from './tokens.js';
import { buildExplainer, updateExplainer, clearExplainer, runtimeCitations } from './explainer.js';
import { renderReceipt, initPrinting, clearReceipt } from './bill.js';
import { buildReferences, buildMethod } from './references.js';
import { calculate } from './calculate.js';
import { initKiosk } from './kiosk.js';

const SECTIONS = ['Tokenization', 'exhibition-layout', 'card-receipt', 'sources-method', 'references'];

const newVisitId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

let visitId = newVisitId();
let turns = [];

buildExplainer();
buildMethod();
buildReferences(runtimeCitations());
initPrinting();

const chat = createChat({
  getVisitId: () => visitId,
  onActivity: () => kiosk?.activity(),
  onTurnComplete(turn) {
    turns.push(turn);
    for (const id of SECTIONS) document.getElementById(id).hidden = false;
    const result = calculate(turns);
    renderTokens(turns);
    updateExplainer(result);
    renderReceipt(turns, result);
  },
});

async function resetAll() {
  kiosk?.dismiss();
  turns = [];
  visitId = newVisitId();
  clearTokens();
  clearExplainer();
  clearReceipt();
  for (const id of SECTIONS) document.getElementById(id).hidden = true;
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (location.hash) history.replaceState(null, '', location.pathname);
  await chat.reset();
}

const kiosk = initKiosk({
  hasSomethingToClear: () => turns.length > 0 || chat.hasContent(),
  onReset: resetAll,
});

document.getElementById('reset-btn').addEventListener('click', resetAll);

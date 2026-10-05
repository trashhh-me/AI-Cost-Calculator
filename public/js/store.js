// One visit, shared by the chat page and the cost page: the visit id, every
// finished turn and the questions left. Kept in sessionStorage, so it lasts
// while the visitor moves between the two pages and is wiped by "Start
// again" or the idle reset. Nothing is sent anywhere.
import { CONFIG } from './config.js';

const KEY = 'aidex-visit';

const newVisitId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

function fresh() {
  return { visitId: newVisitId(), turns: [], remaining: CONFIG.limits.maxQuestionsPerVisit };
}

let visit = null;

export function getVisit() {
  if (visit) return visit;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    if (saved && typeof saved.visitId === 'string' && Array.isArray(saved.turns)) visit = saved;
  } catch {
    /* storage blocked or damaged: start fresh */
  }
  visit ||= fresh();
  return visit;
}

export function saveVisit() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(getVisit()));
  } catch {
    /* storage blocked: the visit lasts for this page only */
  }
}

export function addTurn(turn, remaining) {
  const v = getVisit();
  v.turns.push(turn);
  v.remaining = remaining;
  saveVisit();
}

export function setRemaining(remaining) {
  getVisit().remaining = remaining;
  saveVisit();
}

/** Forget everything for the next visitor. */
export function clearVisit() {
  visit = fresh();
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* fine */
  }
  return visit;
}

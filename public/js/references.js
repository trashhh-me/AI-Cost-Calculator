// References: numbered citations in the text, and the reader-style
// "References" section listing every source, what it was used for and
// where it is cited.
import { REFERENCES, REFERENCE_GROUPS, STEPS, TEXT } from './content.js';
import { escapeHTML } from './markdown.js';

const NUMBER = new Map(REFERENCES.map((r, i) => [r.id, i + 1]));
const BY_ID = new Map(REFERENCES.map((r) => [r.id, r]));
const CITE = /\{\{ref:([a-z0-9-]+)\}\}/g;

/** Replace {{ref:id}} marks with numbered links to the References section. */
export function cite(html) {
  return html.replace(CITE, (_, id) => {
    const n = NUMBER.get(id);
    const ref = BY_ID.get(id);
    if (!n) return '';
    return `<sup class="cite"><a href="#ref-${id}" aria-label="Reference ${n}: ${escapeHTML(ref.short)}">[${n}]</a></sup>`;
  });
}

/** Number for a reference id (for text that needs it outside cite()). */
export const refNumber = (id) => NUMBER.get(id);

// Where each reference is cited, for back-links.
function citedIn() {
  const map = new Map();
  const add = (id, label, href) => {
    if (!map.has(id)) map.set(id, []);
    const list = map.get(id);
    if (!list.some((x) => x.href === href)) list.push({ label, href });
  };
  for (const step of STEPS) {
    const text = [...step.body, ...step.research, step.disagree || ''].join(' ');
    for (const [, id] of text.matchAll(CITE)) add(id, stepLabel(step), `#${cardId(step.key)}`);
  }
  for (const [, id] of TEXT.method.join(' ').matchAll(CITE)) add(id, 'Sources and method', '#sources-method');
  return map;
}

export const CARD_IDS = {
  electricity: 'card-energy',
  heat: 'card-heat',
  water: 'card-water',
  carbon: 'card-carbon',
  money: 'card-money',
  scale: 'card-scale',
};
export const cardId = (key) => CARD_IDS[key];
const STEP_LABELS = { scale: 'The bigger picture' };
const stepLabel = (step) => STEP_LABELS[step.key] || step.key[0].toUpperCase() + step.key.slice(1);

/** Build the References section. extraCitations: [{ id, label, href }] added at runtime. */
export function buildReferences(extraCitations = []) {
  const where = citedIn();
  for (const { id, label, href } of extraCitations) {
    if (!where.has(id)) where.set(id, []);
    where.get(id).push({ label, href });
  }

  const root = document.getElementById('reference-list');
  root.replaceChildren();
  for (const g of REFERENCE_GROUPS) {
    const refs = REFERENCES.filter((r) => r.group === g.key);
    if (!refs.length) continue;
    const section = document.createElement('section');
    section.className = 'reference-group';
    section.setAttribute('aria-labelledby', `refgroup-${g.key}`);
    section.innerHTML = `<h3 id="refgroup-${g.key}">${escapeHTML(g.label)}</h3>`;
    const ol = document.createElement('ol');
    ol.className = 'reference-list';
    for (const r of refs) {
      const li = document.createElement('li');
      li.className = 'reference';
      li.id = `ref-${r.id}`;
      const back = (where.get(r.id) || [])
        .map((w) => `<a href="${w.href}">${escapeHTML(w.label)}</a>`)
        .join('');
      li.innerHTML = `
        <span class="reference-number">[${NUMBER.get(r.id)}]</span>
        <div>
          <p>${escapeHTML(r.authors)} (${escapeHTML(r.date)}). <span class="reference-title">${escapeHTML(r.title)}</span>. ${escapeHTML(r.publisher)}.</p>
          <a class="reference-url" href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(r.url)}</a>
          <p class="reference-kind">${escapeHTML(r.kind)}</p>
          <p class="reference-used"><strong>Used for:</strong> ${escapeHTML(r.usedFor)}</p>
          ${back ? `<p class="reference-backlinks">Cited in: ${back}</p>` : ''}
        </div>`;
      ol.append(li);
    }
    section.append(ol);
    root.append(section);
  }
}

/** The "Sources and method" text, with citations. */
export function buildMethod() {
  const root = document.getElementById('method-text');
  root.innerHTML = TEXT.method.map((p) => `<p>${cite(p)}</p>`).join('');
}

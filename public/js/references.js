// References: numbered citations in the exhibit, linking to the separate
// References page (references.html), which lists every source, what it was
// used for and where in the exhibit it is cited.
import { REFERENCES, REFERENCE_GROUPS, STEPS } from './content.js';
import { escapeHTML } from './markdown.js';
import { t, pick, LANGS } from './i18n.js';
import { int } from './format.js';

const NUMBER = new Map(REFERENCES.map((r, i) => [r.id, i + 1]));
const BY_ID = new Map(REFERENCES.map((r) => [r.id, r]));
const CITE = /\{\{ref:([a-z0-9-]+)\}\}/g;

/** Replace {{ref:id}} marks with numbered links to the References section. */
export function cite(html) {
  return html.replace(CITE, (_, id) => {
    const n = NUMBER.get(id);
    const ref = BY_ID.get(id);
    if (!n) return '';
    const label = escapeHTML(t('referenceN', { n: int(n), short: ref.short }));
    return `<sup class="cite"><a href="references.html#ref-${id}" aria-label="${label}">[${int(n)}]</a></sup>`;
  });
}

export const CARD_IDS = {
  electricity: 'est-electricity',
  water: 'est-water',
  carbon: 'est-carbon',
};
export const cardId = (key) => CARD_IDS[key];

// Which steps cite each reference (both languages cite the same sources).
function citedIn(extra) {
  const map = new Map();
  const add = (id, key) => {
    if (!map.has(id)) map.set(id, []);
    if (!map.get(id).includes(key)) map.get(id).push(key);
  };
  for (const step of STEPS.filter((x) => CARD_IDS[x.key])) {
    const text = LANGS.flatMap((l) => [...(step.research[l] || []), step.disagree[l] || '', step.source?.[l] || '']).join(' ');
    for (const [, id] of text.matchAll(CITE)) add(id, step.key);
  }
  for (const { id, step } of extra) add(id, step);
  return map;
}

/** Build the References list. extraCitations: [{ id, step }] cited at runtime. */
export function buildReferences(extraCitations = []) {
  const where = citedIn(extraCitations);
  const names = Object.fromEntries(STEPS.map((s) => [s.key, pick(s.name)]));

  const root = document.getElementById('reference-list');
  root.replaceChildren();
  for (const g of REFERENCE_GROUPS) {
    const refs = REFERENCES.filter((r) => r.group === g.key);
    if (!refs.length) continue;
    const section = document.createElement('section');
    section.className = 'reference-group';
    section.setAttribute('aria-labelledby', `refgroup-${g.key}`);
    section.innerHTML = `<h2 id="refgroup-${g.key}">${escapeHTML(pick(g.label))}</h2>`;
    const ol = document.createElement('ol');
    ol.className = 'reference-list';
    for (const r of refs) {
      const li = document.createElement('li');
      li.className = 'reference';
      li.id = `ref-${r.id}`;
      li.tabIndex = -1;
      const back = (where.get(r.id) || [])
        .map((key) => `<a href="index.html#${cardId(key)}">${escapeHTML(names[key])}</a>`)
        .join(', ');
      // Titles, authors and links stay as published (mostly English).
      li.innerHTML = `
        <span class="reference-number">[${int(NUMBER.get(r.id))}]</span>
        <div>
          <p lang="en">${escapeHTML(r.authors)} (${escapeHTML(r.date)}). <span class="reference-title">${escapeHTML(r.title)}</span>${/[?!.]$/.test(r.title) ? '' : '.'} ${escapeHTML(r.publisher)}.</p>
          <a class="reference-url" href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(r.url)}</a>
          <p class="reference-used"><strong>${t('usedFor')}</strong> ${escapeHTML(pick(r.usedFor))}</p>
          ${back ? `<p class="reference-backlinks">${t('citedIn')} ${back}</p>` : ''}
        </div>`;
      ol.append(li);
    }
    section.append(ol);
    root.append(section);
  }
}

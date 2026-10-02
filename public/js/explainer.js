// Part 3: the explainer. Six readings, each its own static section: the
// explanation, and beside it a photograph with the visitor's own reading.
// The photographs are set in index.html (search for PHOTOGRAPHS).
import { CONFIG } from './config.js';
import { STEPS } from './content.js';
import { cite, cardId } from './references.js';
import { comparisons } from './calculate.js';
import * as f from './format.js';

const $ = (id) => document.getElementById(id);

const PRICING_REF = { anthropic: 'anthropic-pricing', openai: 'openai-pricing', gemini: 'google-pricing' };
const PROMPTS_PER_DAY = 2.5e9; // OpenAI via Axios, July 2025 (see content.js)

// IDs kept from the original layout, plus new ones for the new steps.
const VALUE_IDS = {
  electricity: { value: 'val-wh', analogy: 'analogy-phone' },
  heat: { value: 'val-heat', analogy: 'analogy-bulb' },
  water: { value: 'val-ml', analogy: 'analogy-water' },
  carbon: { value: 'val-co2', analogy: 'analogy-car' },
  money: { value: 'val-usd', analogy: 'analogy-money' },
  scale: { value: 'val-scale', analogy: 'analogy-scale' },
};

const NAMES = {
  electricity: 'Electricity',
  heat: 'Heat',
  water: 'Water',
  carbon: 'Carbon',
  money: 'Money',
  scale: 'At scale',
};

/** Money research lines come from the configured model's real prices. */
export function moneyResearch() {
  const model = CONFIG.models[CONFIG.provider];
  const p = CONFIG.prices[model];
  const ref = PRICING_REF[CONFIG.provider];
  const label = CONFIG.modelLabels[model] || model;
  if (!p) return [`No price is set for ${label} in config.js.`];
  const ratio = p.output / p.input;
  return [
    `${label}: <b>$${p.input}</b> per million tokens read, <b>$${p.output}</b> per million written (${f.sig(ratio, 2)}× more). {{ref:${ref}}}`,
  ];
}

export function buildExplainer() {
  const story = $('scrolling-story');
  STEPS.forEach((step) => {
    const ids = VALUE_IDS[step.key];
    const research = step.key === 'money' ? moneyResearch() : step.research;
    const section = document.createElement('article');
    section.className = 'story-card';
    section.id = cardId(step.key);
    section.dataset.step = step.key;
    section.dataset.resource = step.key;
    section.setAttribute('aria-labelledby', `${section.id}-title`);
    section.innerHTML = `
      <div class="story-text">
        <p class="step-kicker">${NAMES[step.key]}</p>
        <h3 id="${section.id}-title">${step.headline}</h3>
        <div class="story-body">${step.body.map((p) => `<p>${cite(p)}</p>`).join('')}</div>
        ${
          research.length
            ? `<details class="research">
                <summary>What research says</summary>
                <ul>${research.map((r) => `<li>${cite(r)}</li>`).join('')}</ul>
                ${step.disagree ? `<p class="disagree">${cite(step.disagree)}</p>` : ''}
              </details>`
            : ''
        }
      </div>
      <div class="metric-feature">
        <figure class="reading-photo" data-photo="${step.key}">
          <span class="photo-placeholder" aria-hidden="true">${NAMES[step.key]}</span>
        </figure>
        <p class="metric-label" data-label="${step.key}">${NAMES[step.key]}</p>
        <p class="metric-value"><span id="${ids.value}" data-reading="${step.key}">–</span><small data-unit="${step.key}"></small></p>
        <p class="metric-range" data-range="${step.key}"></p>
        <p class="analogy-badge" id="${ids.analogy}-line"></p>
      </div>`;
    story.append(section);
  });

  placePhotos();

  // The last step's closing thought gets a quiet section of its own.
  const closing = STEPS.find((s) => s.closing)?.closing;
  if (closing) $('closing-thought').innerHTML = cite(closing);
}

// Move each photograph from index.html into its reading. A missing file
// keeps the plain placeholder, never a broken image.
function placePhotos() {
  document.querySelectorAll('#reading-photos img[data-step]').forEach((img) => {
    const figure = document.querySelector(`[data-photo="${img.dataset.step}"]`);
    if (!figure) return;
    const show = () => figure.classList.add('has-photo');
    const hide = () => figure.classList.remove('has-photo');
    img.addEventListener('load', show);
    img.addEventListener('error', hide);
    figure.prepend(img);
    if (img.complete && img.naturalWidth > 0) show();
  });
}

/* ---------- Visitor's readings ---------- */

export function updateExplainer(r) {
  const c = comparisons(r);
  const e = f.energy(r.wh.mid);
  const h = f.heat(r.j.mid);
  const w = f.water(r.ml.mid);
  const g = f.carbon(r.g.mid);
  const scale = f.energy(r.wh.mid * PROMPTS_PER_DAY);
  const grid = CONFIG.carbon.venueGrid ? CONFIG.carbon.venueGrid.label : 'world-average';

  const readings = {
    electricity: {
      ...e,
      label: 'Your electricity',
      range: `Range ${f.range(f.energy, r.wh.low, r.wh.high)}`,
      analogy: `<strong></strong> of a phone charge`,
      analogyValue: c.phone,
    },
    heat: {
      ...h,
      label: 'Your heat',
      range: `Range ${f.range(f.heat, r.j.low, r.j.high)}`,
      analogy: `<strong></strong> of a ${CONFIG.comparisons.bulbWatts} W bulb`,
      analogyValue: c.bulb,
    },
    water: {
      ...w,
      label: 'Your water',
      range: `Range ${f.range(f.water, r.ml.low, r.ml.high)}`,
      analogy: `<strong></strong> ${c.water.text}`,
      analogyValue: c.water.value,
    },
    carbon: {
      ...g,
      unit: `${g.unit} CO2e`,
      label: `Your carbon, ${grid} grid`,
      range: `Range ${f.range(f.carbon, r.g.low, r.g.high)}`,
      analogy: `<strong></strong> in a petrol car ${cite('{{ref:epa-vehicle}}')}`,
      analogyValue: c.car,
    },
    money: {
      value: r.money,
      unit: '',
      money: true,
      label: r.allLive ? 'Actual API cost' : 'Live price of these tokens',
      range: r.allLive ? 'Not an estimate.' : 'Sample answers were not charged.',
      analogy: c.perDollar ? `$1 pays for <strong></strong> of these` : '',
      analogyValue: c.perDollar ? f.int(c.perDollar) : '',
    },
    scale: {
      ...scale,
      label: 'Your conversation × 2.5 billion, per day',
      range: `plus ${f.str(f.water(r.ml.mid * PROMPTS_PER_DAY), 2)} water, ${f.str(f.carbon(r.g.mid * PROMPTS_PER_DAY), 2)} CO2e`,
      analogy: '',
      analogyValue: '',
    },
  };

  for (const step of STEPS) {
    const rd = readings[step.key];
    document.querySelector(`[data-label="${step.key}"]`).textContent = rd.label;
    document.querySelector(`[data-reading="${step.key}"]`).textContent = rd.money ? f.usd(rd.value) : f.sig(rd.value, 3);
    document.querySelector(`[data-unit="${step.key}"]`).textContent = rd.unit ? ` ${rd.unit}` : '';
    document.querySelector(`[data-range="${step.key}"]`).textContent = rd.range;
    const analogyLine = $(`${VALUE_IDS[step.key].analogy}-line`);
    analogyLine.innerHTML = rd.analogy;
    const strong = analogyLine.querySelector('strong');
    if (strong) {
      strong.id = VALUE_IDS[step.key].analogy;
      strong.textContent = rd.analogyValue;
    }
  }
}

export function clearExplainer() {
  document.querySelectorAll('[data-reading]').forEach((el) => (el.textContent = '–'));
  document.querySelectorAll('[data-unit], [data-range]').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('[data-label]').forEach((el) => (el.textContent = NAMES[el.dataset.label]));
  document.querySelectorAll('.analogy-badge').forEach((el) => (el.textContent = ''));
}

/** References cited at runtime (for the References back-links). */
export function runtimeCitations() {
  return [
    { id: PRICING_REF[CONFIG.provider], label: 'Money', href: `#${cardId('money')}` },
    { id: 'epa-vehicle', label: 'Carbon', href: `#${cardId('carbon')}` },
  ];
}

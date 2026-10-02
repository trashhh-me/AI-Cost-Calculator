// Part 3: the explainer. Six readings, each its own static section: the
// explanation on the left, and on the right an icon with the visitor's own
// reading. A line separates one reading from the next. No scroll effects.
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

// Simple line icons, drawn for this exhibit (24 × 24, stroked in the
// resource colour). Decorative: the reading's name is always written beside.
const ICONS = {
  electricity: '<path d="M13.5 2.5 5 13.2h6l-1.3 8.3 8.8-11.1h-6.1z"/>',
  heat: '<path d="M12 21.5c-3.9 0-6.5-2.6-6.5-6.2 0-3.2 2.4-5.2 3.6-7.5.5 1.4 1.3 2.4 2.4 2.9C11.2 7.6 12.4 4.6 15 2.6c-.1 3 1.4 4.6 2.6 6.4 1 1.5 1.4 3 1.4 4.6 0 4.6-3 7.9-7 7.9z"/><path d="M12 21.5c-1.6 0-2.7-1.1-2.7-2.7 0-1.6 1.4-2.5 2-3.8.9 1.2 3.4 2 3.4 4 0 1.5-1.1 2.5-2.7 2.5z"/>',
  water: '<path d="M12 2.8c3.1 4.2 6.3 7.8 6.3 11.4a6.3 6.3 0 0 1-12.6 0c0-3.6 3.2-7.2 6.3-11.4z"/><path d="M9 15.4a3.1 3.1 0 0 0 2.6 2.8"/>',
  carbon: '<path d="M6.5 19.5h11.2a3.8 3.8 0 0 0 .6-7.6 5.6 5.6 0 0 0-10.8-1.4A4.6 4.6 0 0 0 6.5 19.5z"/><path d="M9.5 15.5h1.2M13.2 15.5h1.3"/>',
  money: '<circle cx="12" cy="12" r="8.8"/><path d="M14.8 9.1c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2.1 0 2.9 5.8 1.5 5.8 4.4 0 1.3-1.3 2.2-3 2.2-1.3 0-2.5-.6-3-1.6M12 6.2v1.5M12 16.4v1.4"/>',
  scale: '<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2M12 3.2c2.4 2.4 3.6 5.4 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.4-3.6-8.8s1.2-6.4 3.6-8.8z"/>',
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
        <svg class="reading-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[step.key]}</svg>
        <p class="metric-label" data-label="${step.key}">${NAMES[step.key]}</p>
        <p class="metric-value"><span id="${ids.value}" data-reading="${step.key}">–</span><small data-unit="${step.key}"></small></p>
        <p class="metric-range" data-range="${step.key}"></p>
        <p class="analogy-badge" id="${ids.analogy}-line"></p>
      </div>`;
    story.append(section);
  });

  // The last step's closing thought gets a quiet section of its own.
  const closing = STEPS.find((s) => s.closing)?.closing;
  if (closing) $('closing-thought').innerHTML = cite(closing);
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

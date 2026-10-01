// Part 3: the explainer. Six "meter readings", each with plain-language
// text, what research says, and the visitor's own number. The sticky meter
// panel follows along; under 900px the panel is hidden and each card's own
// reading is enough.
import { CONFIG } from './config.js';
import { STEPS } from './content.js';
import { cite, cardId } from './references.js';
import { comparisons } from './calculate.js';
import * as f from './format.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

let readings = {}; // key -> { value, unit, label, decimals }
let counted = new Set(); // steps whose number has counted up for this conversation

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
    const card = document.createElement('article');
    card.className = 'story-card';
    card.id = cardId(step.key);
    card.dataset.step = step.key;
    card.dataset.resource = step.key;
    card.setAttribute('aria-labelledby', `${card.id}-title`);
    card.innerHTML = `
      <p class="step-kicker">${NAMES[step.key]}</p>
      <h3 id="${card.id}-title">${step.headline}</h3>
      <div class="metric-feature">
        ${step.key === 'scale' ? '<p class="metric-caption">Your conversation × 2.5 billion, every day</p>' : ''}
        <p class="metric-value"><span id="${ids.value}" data-reading="${step.key}">–</span><small data-unit="${step.key}"></small></p>
        <p class="metric-range" data-range="${step.key}"></p>
        <p class="analogy-badge" id="${ids.analogy}-line"></p>
      </div>
      <div class="story-body">${step.body.map((p) => `<p>${cite(p)}</p>`).join('')}</div>
      ${step.closing ? `<p class="closing-thought">${cite(step.closing)}</p>` : ''}
      ${
        research.length
          ? `<details class="research">
              <summary>What research says</summary>
              <ul>${research.map((r) => `<li>${cite(r)}</li>`).join('')}</ul>
              ${step.disagree ? `<p class="disagree">${cite(step.disagree)}</p>` : ''}
            </details>`
          : ''
      }`;
    story.append(card);
  });

  observeSteps();
  setActive(STEPS[0].key);
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
  readings = {
    electricity: {
      ...e,
      label: 'Electricity',
      range: `Range ${f.range(f.energy, r.wh.low, r.wh.high)}`,
      analogy: `<strong></strong> of a phone charge`,
      analogyValue: c.phone,
    },
    heat: {
      ...h,
      label: 'Heat',
      range: `Range ${f.range(f.heat, r.j.low, r.j.high)}`,
      analogy: `<strong></strong> of a ${CONFIG.comparisons.bulbWatts} W bulb`,
      analogyValue: c.bulb,
    },
    water: {
      ...w,
      label: 'Water',
      range: `Range ${f.range(f.water, r.ml.low, r.ml.high)}`,
      analogy: `<strong></strong> ${c.water.text}`,
      analogyValue: c.water.value,
    },
    carbon: {
      ...g,
      unit: `${g.unit} CO2e`,
      label: `Carbon, ${grid} grid`,
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
      label: 'Per day, at ChatGPT’s scale',
      range: `plus ${f.str(f.water(r.ml.mid * PROMPTS_PER_DAY), 2)} water, ${f.str(f.carbon(r.g.mid * PROMPTS_PER_DAY), 2)} CO2e`,
      analogy: '',
      analogyValue: '',
    },
  };

  for (const step of STEPS) {
    const rd = readings[step.key];
    const valueEl = document.querySelector(`[data-reading="${step.key}"]`);
    const unitEl = document.querySelector(`[data-unit="${step.key}"]`);
    valueEl.textContent = display(rd);
    unitEl.textContent = rd.unit ? ` ${rd.unit}` : '';
    document.querySelector(`[data-range="${step.key}"]`).textContent = rd.range;
    const analogyLine = $(`${VALUE_IDS[step.key].analogy}-line`);
    analogyLine.innerHTML = rd.analogy;
    const strong = analogyLine.querySelector('strong');
    if (strong) {
      strong.id = VALUE_IDS[step.key].analogy;
      strong.textContent = rd.analogyValue;
    }
  }
  counted = new Set();
  setActive(activeKey, true);
}

function display(rd, value = rd.value) {
  return rd.money ? f.usd(value) : f.sig(value, 3);
}

export function clearExplainer() {
  readings = {};
  counted = new Set();
  document.querySelectorAll('[data-reading]').forEach((el) => (el.textContent = '–'));
  document.querySelectorAll('[data-unit], [data-range]').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.analogy-badge').forEach((el) => (el.textContent = ''));
  setActive(STEPS[0].key, true);
}

/* ---------- Sticky meter panel ---------- */

let activeKey = null;

function observeSteps() {
  // A step is "active" when it crosses the middle band of the screen.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.dataset.step);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  document.querySelectorAll('.story-card').forEach((card) => io.observe(card));

  // Count each number up once when its card comes into view.
  const countIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const key = e.target.dataset.step;
        if (readings[key] && !counted.has(key)) {
          counted.add(key);
          countUp(document.querySelector(`[data-reading="${key}"]`), readings[key]);
        }
      }
    },
    { threshold: 0.35 },
  );
  document.querySelectorAll('.story-card').forEach((card) => countIO.observe(card));
}

function setActive(key, force = false) {
  if (!key || (key === activeKey && !force)) return;
  const changed = key !== activeKey;
  activeKey = key;
  const step = STEPS.find((s) => s.key === key);
  const panel = document.querySelector('.sticky-visual-panel');
  panel.dataset.resource = key;

  const rd = readings[key];
  const number = $('callout-number');
  $('callout-unit').textContent = rd ? rd.unit : step.unitLabel;
  $('callout-label').textContent = rd ? [rd.label, rd.range].filter(Boolean).join(' · ') : NAMES[key];
  if (rd) {
    if (changed && !counted.has(`panel-${key}`)) {
      counted.add(`panel-${key}`);
      countUp(number, rd);
    } else number.textContent = display(rd);
  } else number.textContent = '–';

  if (changed) swapImage(step);
}

function swapImage(step) {
  const img = $('dynamic-display-img');
  const fallback = $('image-fallback');
  const caption = $('img-caption-tag');
  const show = () => {
    const probe = new Image();
    probe.onload = () => {
      img.src = step.image.src;
      img.alt = step.image.alt;
      img.hidden = false;
      fallback.hidden = true;
      img.classList.remove('is-swapping');
    };
    probe.onerror = () => {
      // No photograph yet: show the designed fallback, never a broken image.
      img.hidden = true;
      img.alt = '';
      fallback.hidden = false;
      $('image-fallback-word').textContent = NAMES[step.key];
      img.classList.remove('is-swapping');
    };
    probe.src = step.image.src;
    caption.textContent = step.image.caption;
  };
  if (reducedMotion() || img.hidden) show();
  else {
    img.classList.add('is-swapping');
    setTimeout(show, 150);
  }
}

/* ---------- Count-up: numbers rise once, like a meter ---------- */

function countUp(el, rd) {
  if (!el) return;
  if (reducedMotion()) {
    el.textContent = display(rd);
    return;
  }
  const start = performance.now();
  const duration = 900;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = t < 1 ? display(rd, rd.value * eased) : display(rd);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** References cited at runtime (for the References back-links). */
export function runtimeCitations() {
  return [
    { id: PRICING_REF[CONFIG.provider], label: 'Money', href: `#${cardId('money')}` },
    { id: 'epa-vehicle', label: 'Carbon', href: `#${cardId('carbon')}` },
  ];
}

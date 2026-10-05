// How we estimate: one static section per reading. Each shows, in plain
// words, how the number is worked out, the calculation itself with the
// visitor's own tokens and the coefficients from config.js, and beside it
// a photograph with the result. The photographs are set in index.html
// (search for PHOTOGRAPHS).
import { CONFIG, costUSD } from './config.js';
import { STEPS, CLOSING } from './content.js';
import { cite, cardId } from './references.js';
import { comparisons } from './calculate.js';
import { t, pick, getLang } from './i18n.js';
import * as f from './format.js';

const $ = (id) => document.getElementById(id);

const PRICING_REF = { anthropic: 'anthropic-pricing', openai: 'openai-pricing', gemini: 'google-pricing' };
const COMPANY = { anthropic: 'Anthropic', openai: 'OpenAI', gemini: 'Google' };

/** "Where the numbers come from" for the price: the configured model's list price. */
function moneySource(r) {
  const model = r.priceModel;
  const p = CONFIG.prices[model];
  if (!p) return t('noPrice', { model });
  const label = CONFIG.modelLabels[model] || model;
  return `${t('sourceMoney', { model: label, in: f.num(p.input), out: f.num(p.output), company: COMPANY[CONFIG.provider] })} {{ref:${PRICING_REF[CONFIG.provider]}}}`;
}
const PROMPTS_PER_DAY = 2.5e9; // OpenAI via Axios, July 2025 (see content.js)

/** Build the empty sections once; fillExplainer() writes the words and numbers. */
export function buildExplainer() {
  const story = $('scrolling-story');
  for (const step of STEPS) {
    const section = document.createElement('article');
    section.className = 'story-card';
    section.id = cardId(step.key);
    section.dataset.step = step.key;
    section.dataset.resource = step.key;
    section.setAttribute('aria-labelledby', `${section.id}-title`);
    section.innerHTML = `
      <div class="story-text">
        <p class="step-kicker" data-part="name"></p>
        <h3 id="${section.id}-title" data-part="headline"></h3>
        <p class="story-body" data-part="body"></p>
        <div class="working">
          <p class="working-label" data-part="working-label"></p>
          <div class="calc" data-part="calc"></div>
        </div>
        <p class="source" data-part="source"></p>
        <details class="research" data-part="research-box">
          <summary data-part="research-label"></summary>
          <ul data-part="research"></ul>
          <p class="disagree" data-part="disagree"></p>
        </details>
      </div>
      <div class="metric-feature">
        <figure class="reading-photo" data-photo="${step.key}">
          <span class="photo-placeholder" aria-hidden="true" data-part="placeholder"></span>
        </figure>
        <p class="metric-label" data-part="label"></p>
        <p class="metric-value"><span data-part="value">–</span><small data-part="unit"></small></p>
        <p class="metric-range" data-part="range"></p>
        <p class="analogy-badge" data-part="analogy"></p>
      </div>`;
    story.append(section);
  }
  placePhotos();
}

// Move each photograph from index.html into its reading. A missing file
// keeps the plain placeholder, never a broken image.
function placePhotos() {
  document.querySelectorAll('#reading-photos img[data-step]').forEach((img) => {
    const figure = document.querySelector(`[data-photo="${img.dataset.step}"]`);
    if (!figure) return;
    img.dataset.altEn = img.alt;
    const show = () => figure.classList.add('has-photo');
    const hide = () => figure.classList.remove('has-photo');
    img.addEventListener('load', show);
    img.addEventListener('error', hide);
    figure.prepend(img);
    if (img.complete && img.naturalWidth > 0) show();
  });
}

// One line of a worked calculation: the sum on the left, the result on the right.
function calcLine(expr, value, cls = '') {
  return `<p class="calc-line ${cls}"><span>${expr}</span><span class="calc-value">${value}</span></p>`;
}

const wh = (n) => `${f.sig(n, 3)} Wh`;

function calculation(key, r) {
  const e = CONFIG.energy;
  const w = CONFIG.water;
  const gPerWh = CONFIG.carbon.venueGrid?.gPerWh ?? CONFIG.carbon.centralGPerWh;
  const whMid = r.wh.mid;
  switch (key) {
    case 'electricity':
      return (
        calcLine(t('calc.read', { n: f.int(r.input), k: f.num(e.inputWhPerToken) }), wh(r.input * e.inputWhPerToken)) +
        calcLine(t('calc.written', { n: f.int(r.output), k: f.num(e.outputWhPerToken) }), wh(r.output * e.outputWhPerToken)) +
        calcLine('=', wh(whMid), 'calc-total')
      );
    case 'heat':
      return (
        calcLine(t('calc.heat', { wh: f.sig(whMid, 3), k: f.num(CONFIG.joulesPerWh) }), '') +
        calcLine('=', f.str(f.heat(r.j.mid)), 'calc-total')
      );
    case 'water':
      return (
        calcLine(t('calc.water', { wh: f.sig(whMid, 3), a: f.num(w.onSiteMlPerWh), b: f.num(w.generationMlPerWh) }), '') +
        calcLine('=', f.str(f.water(r.ml.mid)), 'calc-total')
      );
    case 'carbon':
      return (
        calcLine(t('calc.carbon', { wh: f.sig(whMid, 3), k: f.num(gPerWh) }), '') +
        calcLine('=', `${f.str(f.carbon(r.g.mid))} CO₂e`, 'calc-total')
      );
    case 'money': {
      const model = r.priceModel;
      const p = CONFIG.prices[model];
      if (!p) return calcLine('=', f.usd(r.money), 'calc-total');
      return (
        calcLine(t('calc.moneyIn', { n: f.int(r.input), p: f.num(p.input) }), f.usd(costUSD(model, r.input, 0))) +
        calcLine(t('calc.moneyOut', { n: f.int(r.output), p: f.num(p.output) }), f.usd(costUSD(model, 0, r.output))) +
        calcLine('=', f.usd(r.money), 'calc-total')
      );
    }
    case 'scale':
      return (
        calcLine(t('calc.scale', { wh: f.sig(whMid, 3), k: t('n.2_5bn') }), '') +
        calcLine('=', t('calc.perDay', { v: f.str(f.energy(whMid * PROMPTS_PER_DAY), 3) }), 'calc-total')
      );
    default:
      return '';
  }
}

function gridName() {
  const g = CONFIG.carbon.venueGrid;
  return g ? g.label : t('worldAverage');
}

/** The visitor's reading for each step: value, unit, label, range, analogy. */
function readings(r) {
  const c = comparisons(r);
  const e = f.energy(r.wh.mid);
  const h = f.heat(r.j.mid);
  const w = f.water(r.ml.mid);
  const g = f.carbon(r.g.mid);
  const scale = f.energy(r.wh.mid * PROMPTS_PER_DAY);
  const range = (fn, lo, hi) => t('range', { r: f.range(fn, lo, hi) });
  return {
    electricity: {
      ...e,
      label: t('label.electricity'),
      range: range(f.energy, r.wh.low, r.wh.high),
      analogy: t('analogy.phone', { v: c.phone }),
    },
    heat: {
      ...h,
      label: t('label.heat'),
      range: range(f.heat, r.j.low, r.j.high),
      analogy: t('analogy.bulb', { v: c.bulb, w: f.int(CONFIG.comparisons.bulbWatts) }),
    },
    water: {
      ...w,
      label: t('label.water'),
      range: range(f.water, r.ml.low, r.ml.high),
      analogy: t(c.water.key, { v: c.water.value }),
    },
    carbon: {
      ...g,
      unit: `${g.unit} CO₂e`,
      label: t('label.carbon', { grid: gridName() }),
      range: range(f.carbon, r.g.low, r.g.high),
      analogy: t('analogy.car', { v: c.car, cite: cite('{{ref:epa-vehicle}}') }),
    },
    money: {
      value: r.money,
      unit: '',
      money: true,
      label: r.allLive ? t('label.moneyLive') : t('label.moneySample'),
      range: r.allLive ? t('notEstimate') : t('notCharged'),
      analogy: c.perDollar ? t('analogy.money', { v: f.int(c.perDollar) }) : '',
    },
    scale: {
      ...scale,
      label: t('label.scale'),
      range: t('scalePlus', {
        w: f.str(f.water(r.ml.mid * PROMPTS_PER_DAY), 2),
        c: f.str(f.carbon(r.g.mid * PROMPTS_PER_DAY), 2),
      }),
      analogy: '',
    },
  };
}

/** Write every section in the current language, with the visitor's numbers. */
export function fillExplainer(r) {
  const all = readings(r);
  for (const step of STEPS) {
    const card = $(cardId(step.key));
    const part = (name) => card.querySelector(`[data-part="${name}"]`);
    const rd = all[step.key];

    part('name').textContent = pick(step.name);
    part('placeholder').textContent = pick(step.name);
    part('headline').textContent = pick(step.headline);
    part('body').textContent = pick(step.body);
    part('working-label').textContent = t('workingLabel');
    part('calc').innerHTML = calculation(step.key, r);
    const source = step.key === 'money' ? moneySource(r) : pick(step.source);
    part('source').innerHTML = `<strong>${t('sourceLabel')}</strong> ${cite(source)}`;

    const research = pick(step.research);
    part('research-box').hidden = research.length === 0;
    part('research-label').textContent = t('research');
    part('research').innerHTML = research.map((x) => `<li>${cite(x)}</li>`).join('');
    const disagree = pick(step.disagree);
    part('disagree').innerHTML = disagree ? cite(disagree) : '';
    part('disagree').hidden = !disagree;

    part('label').textContent = rd.label;
    part('value').textContent = rd.money ? f.usd(rd.value) : f.sig(rd.value, 3);
    part('unit').textContent = rd.unit ? ` ${rd.unit}` : '';
    part('range').textContent = rd.range;
    part('analogy').innerHTML = rd.analogy;
  }

  // Photo descriptions follow the language (data-alt-ne in index.html).
  for (const img of document.querySelectorAll('.reading-photo img')) {
    img.alt = getLang() === 'ne' && img.dataset.altNe ? img.dataset.altNe : img.dataset.altEn || img.alt;
  }

  $('closing-thought').textContent = pick(CLOSING);
}

/** References cited at runtime (for the References back-links). */
export function runtimeCitations() {
  return [
    { id: PRICING_REF[CONFIG.provider], step: 'money' },
    { id: 'epa-vehicle', step: 'carbon' },
  ];
}

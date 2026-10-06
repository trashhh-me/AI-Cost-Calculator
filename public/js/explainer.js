// "How do we estimate this?":
// one fold-out block per reading, each with a plain explanation, the sum
// with the visitor's own tokens, and where the numbers come from.
import { CONFIG } from './config.js';
import { STEPS } from './content.js';
import { cite } from './references.js';
import { t, pick } from './i18n.js';
import * as f from './format.js';
import { comparisons } from './calculate.js';

/** The readings shown on this page, in order. */
export const SHOWN = ['electricity', 'water', 'carbon'];

const co2 = (g) => `${f.str(f.carbon(g))} CO₂e`;

// One line of a sum: the working on the left, the result on the right.
const line = (expr, value = '', cls = '') =>
  `<p class="calc-line ${cls}"><span>${expr}</span><span class="calc-value">${value}</span></p>`;
const wh = (n) => `${f.sig(n, 3)} Wh`;

function calculation(key, r) {
  const e = CONFIG.energy;
  const w = CONFIG.water;
  const gPerWh = CONFIG.carbon.venueGrid?.gPerWh ?? CONFIG.carbon.centralGPerWh;
  switch (key) {
    case 'electricity':
      return (
        line(t('calc.read', { n: f.int(r.input), k: f.num(e.inputWhPerToken) }), wh(r.input * e.inputWhPerToken)) +
        line(t('calc.written', { n: f.int(r.output), k: f.num(e.outputWhPerToken) }), wh(r.output * e.outputWhPerToken)) +
        line('=', `${wh(r.wh.mid)} (${f.str(f.energy(r.wh.mid))})`, 'calc-total')
      );
    case 'water':
      return (
        line(t('calc.water', { wh: f.sig(r.wh.mid, 3), a: f.num(w.onSiteMlPerWh), b: f.num(w.generationMlPerWh) })) +
        line('=', f.str(f.water(r.ml.mid)), 'calc-total')
      );
    case 'carbon':
      return (
        line(t('calc.carbon', { wh: f.sig(r.wh.mid, 3), k: f.num(gPerWh) })) + line('=', co2(r.g.mid), 'calc-total')
      );
    default:
      return '';
  }
}

// The range (low to high) and an everyday comparison for each reading.
function extras(key, r) {
  const c = comparisons(r);
  if (key === 'electricity')
    return { range: t('range', { r: f.range(f.energy, r.wh.low, r.wh.high) }), compare: t('analogy.phone', { v: c.phone }) };
  if (key === 'water')
    return { range: t('range', { r: f.range(f.water, r.ml.low, r.ml.high) }), compare: t(c.water.key, { v: c.water.value }) };
  return {
    range: t('range', { r: f.range(f.carbon, r.g.low, r.g.high) }),
    compare: t('analogy.car', { v: c.car, cite: cite('{{ref:epa-vehicle}}') }),
  };
}

/** Write each fold-out block in the current language, with the visitor's numbers. */
export function fillExplainer(r) {
  // The result shown on the right of each step's bar
  document.getElementById('value-text').textContent = `${f.int(r.total)} ${t('tokens')}`;
  document.getElementById('value-electricity').textContent = f.str(f.energy(r.wh.mid));
  document.getElementById('value-water').textContent = f.str(f.water(r.ml.mid));
  document.getElementById('value-carbon').textContent = co2(r.g.mid);

  for (const key of SHOWN) {
    const step = STEPS.find((s) => s.key === key);
    const body = document.querySelector(`[data-est="${key}"] .est-body`);
    body.innerHTML = `
      <div class="est-text">
        <p>${pick(step.body)}</p>
        <p class="source"><strong>${t('sourceLabel')}:</strong> ${cite(pick(step.source))}</p>
      </div>
      <div class="your-numbers">
        <p class="working-label">${t('workingLabel')}</p>
        <div class="calc">${calculation(key, r)}</div>
        <p class="est-range">${extras(key, r).range}</p>
        <p class="est-compare">${extras(key, r).compare}</p>
      </div>`;
  }
}

/** References cited only at runtime (none on this page). */
export function runtimeCitations() {
  return [];
}

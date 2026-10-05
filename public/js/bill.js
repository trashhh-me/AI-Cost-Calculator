// The bill. An itemised thermal-paper receipt, calculated from the exact
// token counts and the coefficients in config.js, printed with a short
// paper-feed animation when it comes into view.
import { CONFIG, costUSD } from './config.js';
import { STEPS } from './content.js';
import { escapeHTML } from './markdown.js';
import * as f from './format.js';
import { t, pick } from './i18n.js';

const name = (key) => pick(STEPS.find((s) => s.key === key).name);

const $ = (id) => document.getElementById(id);
let printedVersion = -1;
let version = 0;

const line = (label, value, { id = '', cls = '', sub = '', resource = '' } = {}) => `
  <div class="receipt-line ${cls}"${resource ? ` data-resource="${resource}"` : ''}>
    <span${resource ? ' class="receipt-resource"' : ''}>${label}</span>
    <strong${id ? ` id="${id}"` : ''}>${value}</strong>
    ${sub ? `<span class="receipt-sub">${sub}</span>` : ''}
  </div>`;

export function renderReceipt(turns, r) {
  version++;
  const model = r.priceModel;
  const label = escapeHTML(turns[turns.length - 1]?.modelLabel || CONFIG.modelLabels[model] || model);
  const price = CONFIG.prices[model];
  const when = f.dateTime();
  const status = r.allLive ? t('r.live') : r.anyLive ? t('r.mixed') : t('r.sample');
  const n = CONFIG.scalePeople;
  const co2 = (g) => `${f.str(f.carbon(g))} CO₂e`;

  const perTurn = turns
    .map((turn) => {
      const mark = !turn.live ? t('r.markSample') : turn.stopped ? t('r.markStopped') : '';
      const q = f.int(turn.number);
      return (
        line(t('r.sent', { n: q }) + mark, f.int(turn.input)) +
        line(t('r.written', { n: q }), f.int(turn.output), {
          sub: turn.thinking ? t('r.thinking', { n: f.int(turn.thinking) }) : '',
        })
      );
    })
    .join('');

  $('thermal-receipt').innerHTML = `
    <header class="receipt-header">
      <h2 lang="en">AI DEX</h2>
      <p>${escapeHTML(when)}</p>
      <p>${t('r.model', { m: label })}</p>
      <p>${status}</p>
    </header>
    <hr class="receipt-divider">

    <p class="receipt-section-title">${t('r.tokens')}</p>
    ${perTurn}
    <hr class="receipt-divider">
    ${line(t('r.input'), f.int(r.input), { id: 'receipt-in-tokens' })}
    ${line(t('r.output'), f.int(r.output), { id: 'receipt-out-tokens' })}
    ${line(t('r.total'), f.int(r.total), { id: 'receipt-total-tokens', cls: 'sub-total' })}
    <hr class="receipt-divider">

    <p class="receipt-section-title">${t('r.estimated')}</p>
    ${line(name('electricity'), f.str(f.energy(r.wh.mid)), {
      id: 'receipt-wh',
      resource: 'electricity',
      sub: f.range(f.energy, r.wh.low, r.wh.high),
    })}
    ${line(name('heat'), f.str(f.heat(r.j.mid)), { id: 'receipt-heat', resource: 'heat', sub: f.range(f.heat, r.j.low, r.j.high) })}
    ${line(name('water'), f.str(f.water(r.ml.mid)), { id: 'receipt-ml', resource: 'water', sub: f.range(f.water, r.ml.low, r.ml.high) })}
    ${line(name('carbon'), co2(r.g.mid), { id: 'receipt-co2', resource: 'carbon', sub: f.range(f.carbon, r.g.low, r.g.high) })}
    <hr class="receipt-divider receipt-divider--double">

    ${line(r.allLive ? t('r.costLive') : t('r.costSample'), f.usd(r.money), { id: 'receipt-cost', cls: 'total-line', resource: 'money' })}
    ${r.allLive ? '' : `<p class="receipt-note">${t('notCharged')}</p>`}
    ${
      price
        ? line(t('r.in', { n: f.int(r.input), p: f.num(price.input) }), f.usd(costUSD(model, r.input, 0)), { cls: 'sub-total' }) +
          line(t('r.out', { n: f.int(r.output), p: f.num(price.output) }), f.usd(costUSD(model, 0, r.output)), { cls: 'sub-total' })
        : ''
    }
    <hr class="receipt-divider">

    <div class="receipt-scale" id="receipt-at-scale">
      <p class="receipt-section-title">${t('r.people', { n: f.int(n) })}</p>
      ${line(name('money'), f.usd(r.money * n))}
      ${line(name('electricity'), f.str(f.energy(r.wh.mid * n)))}
      ${line(name('water'), f.str(f.water(r.ml.mid * n)))}
      ${line(name('carbon'), co2(r.g.mid * n))}
    </div>
    <hr class="receipt-divider">

    <footer class="receipt-footer">
      <p>${t('r.thanks')}</p>
    </footer>`;
}

/** Print the receipt (paper feed) once per new bill, when it is on screen. */
export function initPrinting() {
  const receipt = $('thermal-receipt');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || printedVersion === version) continue;
        printedVersion = version;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        receipt.classList.remove('is-printing');
        void receipt.offsetWidth; // restart the animation
        receipt.classList.add('is-printing');
      }
    },
    { threshold: 0.2 },
  );
  io.observe($('bill'));
}

export function clearReceipt() {
  $('thermal-receipt').replaceChildren();
  $('thermal-receipt').classList.remove('is-printing');
  printedVersion = -1;
}

// Part 4: the bill. An itemised thermal-paper receipt, calculated from the
// exact token counts and the coefficients in config.js, printed with a short
// paper-feed animation when it comes into view.
import { CONFIG, costUSD } from './config.js';
import { escapeHTML } from './markdown.js';
import * as f from './format.js';

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
  const model = turns[turns.length - 1]?.priceModel || CONFIG.models[CONFIG.provider];
  const label = escapeHTML(turns[turns.length - 1]?.modelLabel || CONFIG.modelLabels[model] || model);
  const price = CONFIG.prices[model];
  const when = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const status = r.allLive ? 'Live answers' : r.anyLive ? 'Live and sample answers' : 'Sample answers';
  const n = CONFIG.scalePeople;

  const perTurn = turns
    .map((t) => {
      const mark = !t.live ? ' (sample)' : t.stopped ? ' (stopped)' : '';
      return (
        line(`Q${t.number} sent${mark}`, f.int(t.input)) +
        line(`Q${t.number} written`, f.int(t.output), {
          sub: t.thinking ? `incl. ${f.int(t.thinking)} hidden thinking tokens` : '',
        })
      );
    })
    .join('');

  const moneyLabel = r.allLive ? 'ACTUAL API COST' : 'PRICE OF THESE TOKENS';
  const moneySub = r.allLive ? '' : 'Sample answers were not charged.';

  $('thermal-receipt').innerHTML = `
    <header class="receipt-header">
      <h3>AI DEX</h3>
      <p>${escapeHTML(when)}</p>
      <p>Model: ${label}</p>
      <p>${status}</p>
    </header>
    <hr class="receipt-divider">

    <p class="receipt-section-title">Tokens</p>
    ${perTurn}
    <hr class="receipt-divider">
    ${line('Input tokens', f.int(r.input), { id: 'receipt-in-tokens' })}
    ${line('Output tokens', f.int(r.output), { id: 'receipt-out-tokens' })}
    ${line('Total tokens', f.int(r.total), { id: 'receipt-total-tokens', cls: 'sub-total' })}
    <hr class="receipt-divider">

    <p class="receipt-section-title">Estimated use</p>
    ${line('Electricity', f.str(f.energy(r.wh.mid)), {
      id: 'receipt-wh',
      resource: 'electricity',
      sub: f.range(f.energy, r.wh.low, r.wh.high),
    })}
    ${line('Heat', f.str(f.heat(r.j.mid)), { id: 'receipt-heat', resource: 'heat', sub: f.range(f.heat, r.j.low, r.j.high) })}
    ${line('Water', f.str(f.water(r.ml.mid)), {
      id: 'receipt-ml',
      resource: 'water',
      sub: f.range(f.water, r.ml.low, r.ml.high),
    })}
    ${line('Carbon', `${f.str(f.carbon(r.g.mid))} CO2e`, {
      id: 'receipt-co2',
      resource: 'carbon',
      sub: f.range(f.carbon, r.g.low, r.g.high),
    })}
    <hr class="receipt-divider receipt-divider--double">

    ${line(moneyLabel, f.usd(r.money), { id: 'receipt-cost', cls: 'total-line', resource: 'money' })}
    ${moneySub ? `<p class="receipt-note">${moneySub}</p>` : ''}
    ${
      price
        ? line(`${f.int(r.input)} in × $${price.input}/M`, f.usd(costUSD(model, r.input, 0)), { cls: 'sub-total' }) +
          line(`${f.int(r.output)} out × $${price.output}/M`, f.usd(costUSD(model, 0, r.output)), { cls: 'sub-total' })
        : ''
    }
    <hr class="receipt-divider">

    <div class="receipt-scale" id="receipt-at-scale">
      <p class="receipt-section-title">× ${f.int(n)} people</p>
      ${line('Money', f.usd(r.money * n))}
      ${line('Electricity', f.str(f.energy(r.wh.mid * n)))}
      ${line('Water', f.str(f.water(r.ml.mid * n)))}
      ${line('Carbon', `${f.str(f.carbon(r.g.mid * n))} CO2e`)}
    </div>
    <hr class="receipt-divider">

    <footer class="receipt-footer">
      <p>*** THANK YOU ***</p>
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
  io.observe($('card-receipt'));
}

export function clearReceipt() {
  $('thermal-receipt').replaceChildren();
  $('thermal-receipt').classList.remove('is-printing');
  printedVersion = -1;
}

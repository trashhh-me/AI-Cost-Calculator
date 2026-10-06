// The bill: a thermal-paper receipt with three lines (electricity, water,
// carbon), calculated from the exact token counts and the coefficients in
// config.js, printed with a short paper-feed animation when it appears.
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
  const status = r.allLive ? t('r.live') : r.anyLive ? t('r.mixed') : t('r.sample');

  $('thermal-receipt').innerHTML = `
    <header class="receipt-header">
      <h3>${t('appTitle')}</h3>
      <p>${escapeHTML(f.dateTime())}</p>
      <p>${status}</p>
    </header>
    <hr class="receipt-divider">
    <p class="receipt-section-title">${t('billTitle')}</p>
    ${line(name('electricity'), f.str(f.energy(r.wh.mid)), { id: 'receipt-wh', resource: 'electricity' })}
    ${line(name('water'), f.str(f.water(r.ml.mid)), { id: 'receipt-ml', resource: 'water' })}
    ${line(name('carbon'), `${f.str(f.carbon(r.g.mid))} CO₂e`, { id: 'receipt-co2', resource: 'carbon' })}
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

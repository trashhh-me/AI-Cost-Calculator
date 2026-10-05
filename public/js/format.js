// Number formatting: every number should mean something. No "0.00": pick a
// unit (mWh vs Wh, µL vs mL) and enough significant digits instead.
// Digits follow the visitor's language: Devanagari (१२,३४५) in Nepali.
// Converted here rather than by the browser, because many browsers ship
// without Nepali number data.
import { getLang, t } from './i18n.js';

const DEVANAGARI = '०१२३४५६७८९';
/** Western digits → the visitor's digits. */
export function digits(s) {
  return getLang() === 'ne' ? String(s).replace(/[0-9]/g, (d) => DEVANAGARI[d]) : String(s);
}

const nf = (opts) => {
  const fmt = new Intl.NumberFormat('en-US', opts);
  return { format: (n) => digits(fmt.format(n)) };
};

/** Integer with thousands separators: 12,345 */
export function int(n) {
  return nf({ maximumFractionDigits: 0 }).format(Math.round(n || 0));
}

/** n with `digits` significant digits, thousands separators, no exponent. */
export function sig(n, digits = 3) {
  if (!Number.isFinite(n)) return '–';
  if (n === 0) return '0';
  if (Math.abs(n) >= 10 ** digits) return int(n);
  return nf({ maximumSignificantDigits: digits }).format(n);
}

// Pick the unit whose value lands between 1 and 1000 where possible.
function scaled(value, units) {
  let chosen = units[0];
  for (const u of units) if (Math.abs(value) >= u.factor) chosen = u;
  return { value: value / chosen.factor, unit: chosen.unit };
}

/** Energy from Wh → { value, unit } in µWh, mWh, Wh, kWh, MWh or GWh. */
export function energy(wh) {
  return scaled(wh, [
    { factor: 1e-6, unit: 'µWh' },
    { factor: 1e-3, unit: 'mWh' },
    { factor: 1, unit: 'Wh' },
    { factor: 1e3, unit: 'kWh' },
    { factor: 1e6, unit: 'MWh' },
    { factor: 1e9, unit: 'GWh' },
  ]);
}

/** Heat from joules → J, kJ, MJ, GJ, TJ. */
export function heat(j) {
  return scaled(j, [
    { factor: 1, unit: 'J' },
    { factor: 1e3, unit: 'kJ' },
    { factor: 1e6, unit: 'MJ' },
    { factor: 1e9, unit: 'GJ' },
    { factor: 1e12, unit: 'TJ' },
  ]);
}

/** Water from mL → µL, mL, L, then thousands / millions of litres. */
export function water(ml) {
  if (ml >= 1e9) return { value: ml / 1e9, unit: t('unit.millionL') };
  return scaled(ml, [
    { factor: 1e-3, unit: 'µL' },
    { factor: 1, unit: 'mL' },
    { factor: 1e3, unit: 'L' },
  ]);
}

/** Carbon from g CO2e → mg, g, kg, tonnes. */
export function carbon(g) {
  return scaled(g, [
    { factor: 1e-3, unit: 'mg' },
    { factor: 1, unit: 'g' },
    { factor: 1e3, unit: 'kg' },
    { factor: 1e6, unit: 't' },
  ]);
}

/** Money in USD: never "$0.00"; small amounts keep 3 significant digits. */
export function usd(n) {
  if (n == null || !Number.isFinite(n)) return '–';
  if (n === 0) return '$0';
  if (n >= 100) return '$' + nf({ maximumFractionDigits: 0 }).format(n);
  if (n >= 1) return '$' + nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  // e.g. $0.0123, $0.000412
  return '$' + nf({ minimumSignificantDigits: 3, maximumSignificantDigits: 3 }).format(n);
}

/** "{value} {unit}" as a string, using sig(). */
export function str({ value, unit }, digits = 3) {
  return `${sig(value, digits)} ${unit}`;
}

/** A low–high range in the central value's unit family. */
export function range(fn, low, high) {
  const a = fn(low);
  const b = fn(high);
  if (a.unit === b.unit) return `${sig(a.value, 2)}–${sig(b.value, 2)} ${a.unit}`;
  return `${sig(a.value, 2)} ${a.unit} – ${sig(b.value, 2)} ${b.unit}`;
}

/** Duration in seconds → "9 seconds", "2.5 minutes", "3.1 hours". */
export function duration(s) {
  if (s < 1) return t('time.ofSecond', { v: sig(s, 2) });
  if (s < 120) return t('time.seconds', { v: sig(s, 2) });
  if (s < 7200) return t('time.minutes', { v: sig(s / 60, 2) });
  return t('time.hours', { v: sig(s / 3600, 2) });
}

/** Length in metres → "35 cm", "4.2 metres", "3.1 km". */
export function distance(m) {
  if (m < 1) return t('dist.cm', { v: sig(m * 100, 2) });
  if (m < 1000) return t('dist.m', { v: sig(m, 2) });
  return t('dist.km', { v: sig(m / 1000, 2) });
}

/** A plain number from config (e.g. 0.00022 or 3,600), in the visitor's digits. */
export function num(n) {
  return nf({ maximumFractionDigits: 6 }).format(n);
}

/** Seconds with one decimal: 2.4 */
export function seconds(n) {
  return nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
}

const MONTHS_NE = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];

/** Date and time for the receipt: 05 Oct 2026, 14:05 / ०५ अक्टोबर २०२६, १४:०५ */
export function dateTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (getLang() === 'ne') return digits(`${pad(d.getDate())} ${MONTHS_NE[d.getMonth()]} ${d.getFullYear()}, ${time}`);
  const month = d.toLocaleString('en-GB', { month: 'short' });
  return `${pad(d.getDate())} ${month} ${d.getFullYear()}, ${time}`;
}

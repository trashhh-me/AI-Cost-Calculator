// Number formatting: every number should mean something. No "0.00": pick a
// unit (mWh vs Wh, µL vs mL) and enough significant digits instead.

const nf = (opts) => new Intl.NumberFormat('en-US', opts);

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
  if (ml >= 1e9) return { value: ml / 1e9, unit: 'million L' };
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
  if (s < 1) return `${sig(s, 2)} of a second`;
  if (s < 120) return `${sig(s, 2)} seconds`;
  if (s < 7200) return `${sig(s / 60, 2)} minutes`;
  return `${sig(s / 3600, 2)} hours`;
}

/** Length in metres → "35 cm", "4.2 metres", "3.1 km". */
export function distance(m) {
  if (m < 1) return `${sig(m * 100, 2)} cm`;
  if (m < 1000) return `${sig(m, 2)} metres`;
  return `${sig(m / 1000, 2)} km`;
}

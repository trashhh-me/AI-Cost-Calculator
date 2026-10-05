// The visitor's numbers, calculated from exact token counts and the
// coefficients in config.js. Nothing here is hard-coded.
import { CONFIG, costUSD } from './config.js';
import * as f from './format.js';

/**
 * turns: [{ input, output, costUSD, live, priceModel }]
 * Returns totals, low/central/high estimates and everyday comparisons.
 */
export function calculate(turns) {
  const input = turns.reduce((s, t) => s + t.input, 0);
  const output = turns.reduce((s, t) => s + t.output, 0);
  const { energy, water, carbon, comparisons: c } = CONFIG;

  const whMid = input * energy.inputWhPerToken + output * energy.outputWhPerToken;
  const wh = { low: whMid * energy.lowFactor, mid: whMid, high: whMid * energy.highFactor };

  const both = water.onSiteMlPerWh + water.generationMlPerWh;
  const ml = { low: wh.low * water.onSiteMlPerWh, mid: wh.mid * both, high: wh.high * both };

  const gMid = carbon.venueGrid?.gPerWh ?? carbon.centralGPerWh;
  const g = { low: wh.low * carbon.lowGPerWh, mid: wh.mid * gMid, high: wh.high * carbon.highGPerWh };

  const j = { low: wh.low * CONFIG.joulesPerWh, mid: wh.mid * CONFIG.joulesPerWh, high: wh.high * CONFIG.joulesPerWh };

  // Money: the actual charge for live answers; sample answers are priced at
  // the configured model's rate and labelled as such.
  const allLive = turns.length > 0 && turns.every((t) => t.live);
  const anyLive = turns.some((t) => t.live);
  const money = turns.reduce(
    (s, t) => s + (t.live && t.costUSD != null ? t.costUSD : costUSD(t.priceModel, t.input, t.output) ?? 0),
    0,
  );

  // The price list used for the worked calculation: the latest answer's model.
  const priceModel = turns[turns.length - 1]?.priceModel || CONFIG.models[CONFIG.provider];

  return { input, output, total: input + output, wh, j, ml, g, money, allLive, anyLive, priceModel };
}

/** Everyday comparisons for the central estimate. */
export function comparisons(r) {
  const c = CONFIG.comparisons;
  const phonePct = (r.wh.mid / c.phoneBatteryWh) * 100;
  const bulbSeconds = (r.wh.mid * 3600) / c.bulbWatts;
  const carMetres = (r.g.mid / c.carGPerKm) * 1000;
  return {
    phone: `${f.sig(phonePct, 2)}%`,
    bulb: f.duration(bulbSeconds),
    water: waterComparison(r.ml.mid),
    car: f.distance(carMetres),
    perDollar: r.money > 0 ? Math.floor(1 / r.money) : null,
  };
}

// Drops, teaspoons or fractions of a glass, whichever is meaningful.
// Returns a strings.js key and the value to put in it.
function waterComparison(ml) {
  const c = CONFIG.comparisons;
  const drops = ml / c.dropMl;
  if (drops < 1) return { value: f.sig(drops, 2), key: 'water.ofDrop' };
  if (drops < 60) return { value: f.sig(drops, 2), key: drops < 1.5 ? 'water.drop' : 'water.drops' };
  const tsp = ml / c.teaspoonMl;
  if (tsp < 15) return { value: f.sig(tsp, 2), key: tsp < 1.5 ? 'water.tsp' : 'water.tsps' };
  const glasses = ml / c.glassMl;
  if (glasses < 1) return { value: `${f.sig(glasses * 100, 2)}%`, key: 'water.ofGlass' };
  return { value: f.sig(glasses, 2), key: 'water.glasses' };
}

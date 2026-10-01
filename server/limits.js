// Credit protection: a daily spending ledger and a per-visitor question limit.
import fs from 'node:fs';
import path from 'node:path';

export class SpendLedger {
  constructor(dir) {
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
  }

  // The exhibition machine's local date, so the cap resets at local midnight.
  today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  file() {
    return path.join(this.dir, `spend-${this.today()}.json`);
  }

  read() {
    try {
      return JSON.parse(fs.readFileSync(this.file(), 'utf8'));
    } catch {
      return { date: this.today(), usd: 0, requests: 0 };
    }
  }

  spentToday() {
    return this.read().usd;
  }

  add(usd) {
    const rec = this.read();
    rec.usd = Math.round((rec.usd + (usd || 0)) * 1e8) / 1e8;
    rec.requests += 1;
    fs.writeFileSync(this.file(), JSON.stringify(rec, null, 2));
    return rec;
  }
}

// Counts questions per visit. A visit is a random ID the page creates on
// load and replaces on reset; entries expire after an hour.
export class VisitCounter {
  constructor(max) {
    this.max = max;
    this.visits = new Map();
  }

  sweep() {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [id, v] of this.visits) if (v.ts < cutoff) this.visits.delete(id);
  }

  used(id) {
    return this.visits.get(id)?.count || 0;
  }

  // Returns false when the visit has no questions left.
  take(id) {
    this.sweep();
    const v = this.visits.get(id) || { count: 0, ts: Date.now() };
    if (v.count >= this.max) return false;
    v.count += 1;
    v.ts = Date.now();
    this.visits.set(id, v);
    return true;
  }
}

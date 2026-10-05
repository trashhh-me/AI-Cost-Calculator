// Languages: English and Nepali. Every visible word comes from strings.js
// (interface) or content.js (the explanations), so switching language
// re-renders the page without a reload. The choice lasts for the visit and
// is cleared when the exhibit resets for the next visitor.
import { STRINGS } from './strings.js';

export const LANGS = ['en', 'ne'];
const KEY = 'aidex-lang';
const hasDOM = typeof document !== 'undefined';

let lang = 'en';
try {
  if (hasDOM && LANGS.includes(sessionStorage.getItem(KEY))) lang = sessionStorage.getItem(KEY);
} catch {
  /* storage blocked: English */
}

const listeners = new Set();

export const getLang = () => lang;

/** Interface text by key, with {name} placeholders filled from vars. */
export function t(key, vars = {}) {
  let s = STRINGS[lang][key] ?? STRINGS.en[key];
  if (s == null) return key;
  if (typeof s === 'function') return s(vars);
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

/** Pick the current language from a { en, ne } value (or return it as is). */
export function pick(v) {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'en' in v) return v[lang] ?? v.en;
  return v;
}

export function onLangChange(fn) {
  listeners.add(fn);
}

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  try {
    sessionStorage.setItem(KEY, lang);
  } catch {
    /* fine */
  }
  applyStatic();
  for (const fn of listeners) fn(lang);
}

/** Back to English for the next visitor. */
export function resetLang() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* fine */
  }
  setLang('en');
}

/**
 * Fill the static parts of the page:
 *   data-i18n="key"            → text
 *   data-i18n-html="key"       → markup (only for our own strings)
 *   data-i18n-attr="attr:key; attr2:key2" → attributes
 */
export function applyStatic(root = document) {
  if (!hasDOM) return;
  document.documentElement.lang = lang;
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
  for (const b of root.querySelectorAll('[data-set-lang]')) {
    b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
  }
  const title = document.querySelector('title[data-i18n-title]');
  if (title) document.title = t(title.dataset.i18nTitle);
}

/* ---------- Text size (for low vision) ---------- */
const SIZE_KEY = 'aidex-text-size';

function applySize(large) {
  document.documentElement.dataset.textSize = large ? 'large' : '';
  for (const b of document.querySelectorAll('[data-text-size-toggle]')) b.setAttribute('aria-pressed', String(large));
}

export function resetTextSize() {
  try {
    sessionStorage.removeItem(SIZE_KEY);
  } catch {
    /* fine */
  }
  applySize(false);
}

/** Wire the language buttons and the text-size button in the top bar. */
export function initControls({ canSwitch = () => true } = {}) {
  for (const b of document.querySelectorAll('[data-set-lang]')) {
    b.addEventListener('click', () => {
      if (canSwitch()) setLang(b.dataset.setLang);
    });
  }
  let large = false;
  try {
    large = sessionStorage.getItem(SIZE_KEY) === 'large';
  } catch {
    /* fine */
  }
  applySize(large);
  for (const b of document.querySelectorAll('[data-text-size-toggle]')) {
    b.addEventListener('click', () => {
      large = document.documentElement.dataset.textSize !== 'large';
      try {
        sessionStorage.setItem(SIZE_KEY, large ? 'large' : '');
      } catch {
        /* fine */
      }
      applySize(large);
    });
  }
  applyStatic();
}

// Kiosk privacy: after a quiet spell, ask "Still there?" with a countdown,
// then reset everything so the next visitor never sees the last conversation.
import { CONFIG } from './config.js';
import { t } from './i18n.js';
import { int } from './format.js';

export function initKiosk({ hasSomethingToClear, onReset }) {
  const overlay = document.getElementById('idle-overlay');
  const desc = document.getElementById('idle-desc');
  const say = (n) => (desc.textContent = t('startingOver', { n: int(n) }));
  const keepBtn = document.getElementById('idle-continue');
  const { idleSeconds, countdownSeconds } = CONFIG.kiosk;

  let idleTimer = null;
  let tickTimer = null;
  let left = countdownSeconds;
  let lastFocus = null;

  function arm() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(prompt, idleSeconds * 1000);
  }

  function prompt() {
    // Nothing to protect: just make sure the page is back at the start.
    if (!hasSomethingToClear()) {
      if (window.scrollY > 0) onReset();
      arm();
      return;
    }
    lastFocus = document.activeElement;
    left = countdownSeconds;
    say(left);
    overlay.hidden = false;
    keepBtn.focus();
    tickTimer = setInterval(() => {
      left -= 1;
      say(Math.max(0, left));
      if (left <= 0) {
        close(false);
        onReset();
      }
    }, 1000);
  }

  function close(restoreFocus = true) {
    clearInterval(tickTimer);
    overlay.hidden = true;
    if (restoreFocus) lastFocus?.focus?.({ preventScroll: true });
    arm();
  }

  keepBtn.addEventListener('click', () => close(true));
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close(true);
    if (e.key === 'Tab') {
      e.preventDefault(); // keep focus on the only control
      keepBtn.focus();
    }
  });

  // Any interaction counts as "still here".
  const activity = () => {
    if (overlay.hidden) arm();
  };
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll', 'input']) {
    window.addEventListener(type, activity, { passive: true, capture: true });
  }
  arm();

  return { activity, dismiss: () => close(false) };
}

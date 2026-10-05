// AI DEX, the chat page: the chat, the language and text-size controls,
// and the kiosk idle reset. "See what this cost" opens cost.html, which
// reads the same visit from store.js.
import { createChat } from './chat.js';
import { initKiosk } from './kiosk.js';
import { initControls, resetLang, resetTextSize, getLang } from './i18n.js';
import { clearVisit } from './store.js';

let chat = null;
// No language switch mid-answer: the answer being written would be cut off.
initControls({ canSwitch: () => !chat?.isBusy() });

chat = createChat({ onActivity: () => kiosk?.activity() });

async function resetAll() {
  kiosk?.dismiss();
  clearVisit();
  resetLang();
  resetTextSize();
  window.scrollTo({ top: 0, behavior: 'instant' });
  await chat.reset();
}

const kiosk = initKiosk({
  // A language or text size left by the last visitor is reset too.
  hasSomethingToClear: () =>
    chat.hasContent() || getLang() !== 'en' || document.documentElement.dataset.textSize === 'large',
  onReset: resetAll,
});

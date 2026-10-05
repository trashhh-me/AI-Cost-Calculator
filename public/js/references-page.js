// The References page: every source, built from the same content.js the
// exhibit uses, in the visitor's language. "Back" returns to the exact
// place in the exhibit they came from.
import { buildReferences } from './references.js';
import { runtimeCitations } from './explainer.js';
import { initControls, onLangChange, resetLang, resetTextSize } from './i18n.js';
import { initKiosk } from './kiosk.js';
import { clearVisit } from './store.js';

initControls();
const render = () => buildReferences(runtimeCitations());
render();
onLangChange(render);

// Arriving from a citation: bring that entry into view.
if (location.hash) document.getElementById(location.hash.slice(1))?.focus();

// Back to where they were (keeps their scroll position), or to the start.
// (The exhibit saves its scroll position when the visitor leaves it.)
let cameFromExhibit = false;
try {
  cameFromExhibit = sessionStorage.getItem('aidex-scroll') !== null;
} catch {
  /* fine */
}
for (const a of document.querySelectorAll('[data-back]')) {
  a.addEventListener('click', (e) => {
    if (cameFromExhibit && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}

// Idle: forget the visit and go back to the start for the next visitor.
initKiosk({
  hasSomethingToClear: () => true,
  onReset: () => {
    clearVisit();
    resetLang();
    resetTextSize();
    location.replace('index.html');
  },
});

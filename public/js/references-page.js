// The separate References page: the method and every source, built from
// the same content.js the exhibit uses.
import { buildReferences, buildMethod } from './references.js';
import { runtimeCitations } from './explainer.js';

buildMethod();
buildReferences(runtimeCitations());

// Arriving from a citation: bring that entry into view.
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

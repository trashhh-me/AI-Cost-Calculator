# AI Cost Calculator

An interactive exhibit, in English and Nepali, about the hidden cost of
talking to an AI. Visitors ask a question and get a real streamed answer.
Under the answer a card shows what it used, and "See how the cost is
calculated" opens:

1. **The receipt**: electricity, water and carbon for their conversation,
   each with an everyday comparison.
2. **How do we estimate this?**: four colour bands that each open on
   demand: how AI processes the text (tokens), and how electricity, water
   and carbon are worked out, with the sum using the visitor's own tokens
   and the sources.
3. **A disclaimer**, then a closing band with "Ask another question" and a
   link to the **References** page.

A top bar holds the logo, "New chat", the language switch (English /
नेपाली) and a larger-text switch (A+). Everything resets for the next
visitor after a quiet spell.

Everything runs on the exhibition computer. The only thing that needs the
internet is the call to the AI provider, and if that fails the exhibit
answers with clearly labelled sample answers instead.

---

## Install and run on the exhibition machine

1. Install **Node.js 20 or newer** (https://nodejs.org).
2. Copy this folder to the machine and open a terminal in it.
3. Install the server's three provider libraries (one time, needs internet):
   ```
   npm install --omit=dev
   ```
4. Create the key file:
   ```
   cp .env.example .env
   ```
   Open `.env` and paste the API key for your provider after the `=` sign,
   e.g. `ANTHROPIC_API_KEY=sk-ant-...`. Never commit or share this file.
5. Start the exhibit:
   ```
   npm start
   ```
   Then open **http://localhost:3000** in the kiosk browser, full screen.

The terminal shows whether it is running live or on sample answers, the
model, and how much has been spent today.

**Without a key or internet** (rehearsals, testing):
```
npm run demo
```

### Kiosk tips
- Run the browser in kiosk / full-screen mode pointed at `http://localhost:3000`.
- Use a process manager (or a login item) to run `npm start` at boot.
- The server only listens on this computer (`127.0.0.1`). To reach it from
  another device on the network, set `HOST=0.0.0.0` in `.env`.

---

## Switching provider, model or demo mode

Everything is in **`public/js/config.js`**:

| What | Setting |
|---|---|
| Provider | `provider: 'anthropic'` · `'openai'` · `'gemini'` |
| Model | `models: { anthropic: 'claude-opus-5-5', openai: 'gpt-5.4-mini', gemini: 'gemini-3.8-flash' }` |
| Model name shown to visitors | `modelLabels` |
| Price (for the bill) | `prices` — **add a price for any new model**, in USD per million tokens |
| Sample answers only | `demoMode: true` (or `npm run demo`, or `AI_DEX_DEMO=1` in `.env`) |
| Max output per answer | `limits.maxOutputTokens` (default 800) |
| Daily spending cap | `limits.dailySpendCapUSD` (default $5) |
| Questions per visitor | `limits.maxQuestionsPerVisit` (default 3) |
| Idle reset | `kiosk.idleSeconds` (90), `kiosk.countdownSeconds` (15) |
| System prompt (kept short: it is re-sent with every question) | `systemPrompt` |
| Wording on screen | `public/js/strings.js` (buttons, labels) and `public/js/content.js` (explanations), each in English and Nepali |
| Local grid for carbon | `carbon.venueGrid`, e.g. `{ label: 'United States', gPerWh: 0.384 }` |

Then put the matching key in `.env` (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY` or
`GEMINI_API_KEY`) and restart.

Notes per provider:
- **Anthropic**: Claude Opus 5.5 cannot switch its hidden "thinking" off;
  `providerOptions.anthropic.effort: 'low'` keeps it short. Those tokens are
  billed as output and are shown on the receipt. If Anthropic's safety
  system declines a request, it is re-run on Anthropic's recommended fallback
  model and priced at that model's rate.
- **OpenAI**: uses the Responses API. For reasoning models, set
  `providerOptions.openai.reasoningEffort` to the lowest value the model accepts.
- **Gemini**: for Gemini 3.x use `thinkingConfig: { thinkingLevel: 'LOW' }`
  (the lowest level the Flash models accept).

### How the credit is protected
- The key lives only in `.env` on the server; the browser never sees it.
- Every answer's cost (from the provider's exact token counts × `prices`)
  is added to `data/spend-YYYY-MM-DD.json`. Before each request the server
  checks that the worst case for that request still fits under the daily cap.
  When it does not, the exhibit switches to sample answers and says why.
  The cap resets at local midnight.
- Each visit (until the reset button or idle reset) gets at most 3 questions.
- If the AI fails (network, rate limit, out of credit, bad key, no words
  within 30 seconds) the visitor gets a sample answer labelled as such.

---

## What you still need to provide

1. **API key** in `.env` (see above).
2. **Prices to confirm**: Anthropic prices come from Anthropic's official
   model table (September 2026). The **OpenAI and Gemini prices came from
   secondary listings**, because the official pricing pages could not be
   reached from the build machine. Check them on the official pages before
   switching provider.
3. **Research figures to spot-check** (see the table below). Each figure was
   checked against published reporting that quotes the primary source; the
   original PDFs could not be opened from the build machine. The ones most
   worth reading in the original: Epoch AI's 2.5 Wh / 10,000-token figure
   (it sets the input-token weighting), Li et al.'s 3.142 L/kWh, and
   Jegham et al.'s 0.42 Wh (it sets the high end of the range).
4. **Nepali text**: written for this exhibit. Have a native speaker read
   `public/js/strings.js`, the `ne:` lines in `public/js/content.js` and the
   Nepali sample answers in `public/js/demo-answers.js` once before opening.
5. **Stated assumptions** you may want to change in `config.js`: phone
   battery 15 Wh, one drop = 0.05 mL, one glass = 250 mL. The car comparison
   uses the US EPA figure; for another country, replace `carGPerKm`.

---

## Research figures used

All citations, with links, are in `public/js/content.js` and appear in the
**References** page (`public/references.html`).

| Figure | Source | Date | What it covers |
|---|---|---|---|
| ~0.3 Wh per typical query (~500 output tokens); ~2.5 Wh with ~10,000 input tokens; ~40 Wh at 100,000 | Epoch AI (J. You) | Feb 2025 | GPT-4o, estimate from public information. **Basis of the per-token coefficients.** |
| 0.24 Wh median text prompt (0.10 Wh chips only) | Google technical paper | Aug 2025 | Gemini Apps, measured in production: chips, host, idle capacity, PUE |
| PUE 1.09 | Google | Aug 2025 | Google fleet overhead |
| 0.26 mL water per prompt; WUE 1.15 L/kWh | Google | Aug 2025 | On-site cooling only |
| 0.03 g CO2e per prompt | Google | Aug 2025 | Market-based (includes clean-energy contracts) |
| 33× less energy, 44× less carbon per prompt in a year | Google | Aug 2025 | May 2024 to May 2025 |
| 0.34 Wh; 0.000085 gal (~0.32 mL) per query | OpenAI (S. Altman blog) | Jun 2025 | Average ChatGPT query; method not published |
| 0.42 Wh short GPT-4o query; >33 Wh long prompt for o3 / DeepSeek-R1 | Jegham et al., arXiv 2505.09598 | May 2025 (rev. Nov 2025) | Preprint, not peer-reviewed. **Sets the high end of the energy range.** |
| 0.047 kWh vs 2.907 kWh per 1,000 inferences (text vs image generation) | Luccioni, Jernite & Strubell, FAccT | Jun 2024 | Peer-reviewed; models tested in the study |
| 3.142 L/kWh water for electricity generation (US average) | Li, Yang, Islam & Ren | 2023 / CACM 2025 | Off-site water. **Used for central and high water estimates.** |
| 500 mL per 10–50 responses; GPT-3 training ~700,000 L on-site, 5.4 M L total | Li et al. | 2023 | GPT-3, older hardware |
| 1.14 g CO2e, 45 mL per 400-token reply; training + 18 months: 20.4 kt CO2e, 281,000 m³ | Mistral AI with Carbone 4 / ADEME | Jul 2025 | Whole lifecycle including hardware |
| Grid intensity: world 458, EU 210, US 384, China 525 g CO2e/kWh | Ember, Global Electricity Review 2026 | 2026 (2025 data) | **Carbon low / central / high.** |
| 415 TWh (~1.5%) in 2024; ~945 TWh by 2030; ~1,200 TWh by 2035 | IEA, Energy and AI | Apr 2025 | Global data centres |
| 176 TWh (4.4%) in 2023; 325–580 TWh (6.7–12%) by 2028 | LBNL (Shehabi et al.) | Dec 2024 | US data centres |
| 2.5 billion prompts a day | OpenAI via Axios / TechCrunch | Jul 2025 | ChatGPT |
| ~400 g CO2 per mile | US EPA | accessed 2026 | Typical passenger vehicle |
| $4 / $20 per million tokens | Anthropic pricing | Sep 2026 | Claude Opus 5.5 |

### How the visitor's numbers are calculated
- **Tokens**: exact, from the provider's usage data (input includes the hidden
  system prompt and, for follow-ups, the whole earlier conversation).
- **Electricity** = input × 0.00022 Wh + output × 0.0006 Wh (Epoch AI).
  Output weighs ~2.7× input. Range: ×0.8 (Google) to ×1.4 (Jegham et al.).
- **Heat** = Wh × 3,600 J.
- **Water** = Wh × 1.15 mL (low, on-site only) or × (1.15 + 3.142) mL
  (central/high, including power plants).
- **Carbon** = Wh × 0.21 / 0.458 / 0.525 g (EU / world / China grid).
- **Money** = input × input price + output × output price (actual, not an estimate).

No AI company publishes energy per token for its models, so the physical
numbers are a well-sourced order of magnitude, not a meter reading. The
exhibit says so in its disclaimer.

---

## Files

```
server.js                 local server: static files, /api/chat, /api/stop, /api/status
server/providers/         anthropic.js · openai.js · gemini.js · demo.js (same output)
server/limits.js          daily spend ledger, per-visit question limit
server/tokenizer.js       local token counts (samples and stopped answers only)
public/index.html         the calculator: question → answer → bill → how we estimate → disclaimer
public/references.html    every source (opened from the References link and from citations)
public/style.css          all styles, organised by section
public/fonts/             Atkinson Hyperlegible Next & Mono, Mukta (Nepali); SIL Open Font License
public/js/config.js       provider, model, prices, limits, coefficients (server + browser)
public/js/strings.js      interface text, English and Nepali
public/js/content.js      explanations, research figures, references (English and Nepali)
public/js/demo-answers.js template prompts and sample answers (English and Nepali)
public/js/i18n.js         language and text-size switches
public/js/store.js        the visit's finished turns (sessionStorage, wiped on reset)
public/js/main.js         wires the page together · references-page.js: the References page
public/js/chat.js · tokens.js · explainer.js (bill + estimates) · references.js
public/js/calculate.js · format.js · markdown.js · kiosk.js
public/js/vendor/         js-tiktoken with o200k_base (bundled, offline)
scripts/build-vendor.mjs  rebuilds the vendor bundle (npm install && npm run build:vendor)
.github/workflows/pages.yml  publishes public/ to GitHub Pages from the "hosting" branch
```

On GitHub Pages there is no server, so the exhibit answers with its labelled
sample answers; everything else works the same.

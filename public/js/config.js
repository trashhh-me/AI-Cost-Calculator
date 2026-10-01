/*
 * AI DEX: exhibit configuration
 * ------------------------------------------------------------------
 * This one file is read by BOTH the server (server.js) and the browser.
 * The server only ever trusts its own copy, so a visitor editing this file
 * in their browser changes nothing. The API key is NOT here: it lives only
 * in the .env file on the exhibition machine.
 *
 * Every number has a comment naming its source and date. Full citations
 * are in js/content.js (REFERENCES) and appear in the exhibit's
 * "References" section. Items marked ASSUMPTION are stated choices,
 * not published figures.
 */

export const CONFIG = {
  /* ---------------- AI provider ---------------- */

  // Which adapter to use: "anthropic" | "openai" | "gemini".
  provider: 'anthropic',

  // Model ID per provider. Only the active provider's model is used.
  models: {
    anthropic: 'claude-opus-5-5',
    openai: 'gpt-5.4-mini',
    gemini: 'gemini-3.8-flash', // gemini-2.5-flash is closed to new accounts
  },

  // Friendly names shown in small text on the start screen and receipt.
  modelLabels: {
    'claude-opus-5-5': 'Claude Opus 5.5 (Anthropic)',
    'claude-sonnet-5-5': 'Claude Sonnet 5.5 (Anthropic)',
    'claude-haiku-4-5': 'Claude Haiku 4.5 (Anthropic)',
    'gpt-5.4-mini': 'GPT-5.4 mini (OpenAI)',
    'gpt-5-mini': 'GPT-5 mini (OpenAI)',
    'gpt-4o-mini': 'GPT-4o mini (OpenAI)',
    'gemini-2.5-flash': 'Gemini 2.5 Flash (Google)',
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash-Lite (Google)',
    'gemini-3.8-flash': 'Gemini 3.8 Flash (Google)',
  },

  // Provider-specific settings that keep answers quick and costs predictable.
  // Hidden "thinking" tokens are billed as output tokens, so keep them low.
  providerOptions: {
    // Claude Opus 5.5 cannot switch thinking off; "low" effort keeps it brief.
    anthropic: { effort: 'low' },
    // OpenAI reasoning models: set the lowest effort the model accepts
    // (for example 'minimal', 'low' or 'none'; check the model's docs).
    // null = do not send the setting (needed for non-reasoning models).
    openai: { reasoningEffort: null },
    // Gemini 3.5+: thinkingLevel 'LOW' keeps thinking short (3.8 Flash rejects 'MINIMAL'). For Gemini 2.5
    // use { thinkingConfig: { thinkingBudget: 0 } } instead. If a model rejects
    // the setting, the server retries once without it.
    gemini: { thinkingConfig: { thinkingLevel: 'LOW' } },
  },

  /*
   * Prices in US dollars per 1 million tokens, for the "actual cost" line.
   * CHECK THESE AGAINST THE OFFICIAL PRICING PAGE BEFORE OPENING:
   *   Anthropic: https://platform.claude.com/docs/en/about-claude/pricing
   *   OpenAI:    https://openai.com/api/pricing/
   *   Google:    https://ai.google.dev/gemini-api/docs/pricing
   */
  prices: {
    // Anthropic official model table, retrieved 2026-09-25.
    'claude-opus-5-5': { input: 4.0, output: 20.0 },
    'claude-sonnet-5-5': { input: 2.0, output: 10.0 },
    'claude-haiku-4-5': { input: 1.0, output: 5.0 },
    // Fallback model Anthropic may route a declined request to (official table, 2026-09-25).
    'claude-opus-4-8': { input: 5.0, output: 25.0 },
    // OpenAI: from secondary price listings, October 2026. NOT yet checked
    // against openai.com/api/pricing (the official page was unreachable).
    'gpt-5.4-mini': { input: 0.75, output: 4.5 },
    'gpt-5-mini': { input: 0.25, output: 2.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    // Google: from secondary price listings, September 2026. NOT yet checked
    // against ai.google.dev/gemini-api/docs/pricing.
    'gemini-2.5-flash': { input: 0.3, output: 2.5 },
    'gemini-2.5-flash-lite': { input: 0.1, output: 0.4 },
    'gemini-3.8-flash': { input: 0.75, output: 3.75 }, // introductory rate to 2026-12-31
  },

  /* ---------------- Protecting the credit ---------------- */

  limits: {
    maxOutputTokens: 800, // per reply
    maxQuestionsPerVisit: 3, // per visitor, then the bill
    maxPromptChars: 2000, // per message
    dailySpendCapUSD: 5.0, // when reached, the exhibit switches to sample answers
    firstWordsTimeoutSeconds: 30, // no words from the AI by then: show a sample instead
  },

  // true = always use pre-written sample answers (no internet or credit needed).
  // Can also be switched on with the environment variable AI_DEX_DEMO=1.
  demoMode: false,

  /* ---------------- System prompt ---------------- */

  // Kept short on purpose: these instructions are re-sent with every question,
  // so every word here is added to each visitor's input tokens.
  systemPrompt:
    'You are a museum exhibit AI for all ages. Answer helpfully and briefly in plain words. ' +
    'Decline anything unsuitable for families. Do not lecture.',

  /* ---------------- Kiosk behaviour ---------------- */

  kiosk: {
    idleSeconds: 90, // no interaction, then "Still there?"
    countdownSeconds: 15, // then everything resets
  },

  /* ---------------- Physical estimates ----------------
   * The visitor's numbers are calculated from their EXACT token counts.
   *
   * Energy per token, central estimate (Epoch AI, February 2025):
   *   - A typical query with ~500 output tokens uses about 0.3 Wh.
   *     So output: 0.3 Wh / 500 = 0.0006 Wh per output token.
   *   - A query with ~10,000 input tokens (and a typical answer) uses about 2.5 Wh.
   *     So input: (2.5 - 0.3) Wh / 10,000 = 0.00022 Wh per input token.
   *   Output tokens therefore weigh about 2.7 times more than input tokens:
   *   the model reads the prompt in parallel ("prefill") but writes the answer
   *   one token at a time ("decode").
   *   Linear scaling is a fair approximation at exhibit-sized inputs; it
   *   under-counts very long inputs (Epoch: ~40 Wh at 100,000 input tokens).
   */
  energy: {
    inputWhPerToken: 0.00022, // Epoch AI, Feb 2025 (derived as above)
    outputWhPerToken: 0.0006, // Epoch AI, Feb 2025 (derived as above)
    // Range multipliers applied to the central estimate:
    lowFactor: 0.8, // Google, Aug 2025: median Gemini text prompt 0.24 Wh / Epoch 0.3 Wh
    highFactor: 1.4, // Jegham et al., 2025 (preprint): GPT-4o short query 0.42 Wh / Epoch 0.3 Wh
  },

  // Heat: all electricity used by the chips ends up as heat. 1 Wh = 3,600 joules.
  joulesPerWh: 3600,

  /* Water in millilitres per Wh (equal to litres per kWh). */
  water: {
    // Google, Aug 2025: fleet water usage effectiveness 1.15 L/kWh.
    // Covers ON-SITE cooling water only.
    onSiteMlPerWh: 1.15,
    // Li, Yang, Islam & Ren, "Making AI Less Thirsty" (2023/2025): U.S. average
    // water consumed by power plants to generate electricity, 3.142 L/kWh.
    // Covers OFF-SITE water used to generate the electricity.
    generationMlPerWh: 3.142,
    // Low estimate counts on-site cooling only (Google's method).
    // Central and high count on-site cooling + electricity generation (Li et al.'s method).
  },

  /* Carbon: grams of CO2-equivalent per Wh (= kg per kWh). Ember, Global
   * Electricity Review 2026 (2025 data). Set "venueGrid" to use the
   * exhibit's local grid as the central value instead of the world average. */
  carbon: {
    lowGPerWh: 0.21, // EU average grid, 210 gCO2e/kWh (Ember 2026)
    centralGPerWh: 0.458, // World average grid, 458 gCO2e/kWh (Ember 2026)
    highGPerWh: 0.525, // China average grid, 525 gCO2e/kWh (Ember 2026)
    venueGrid: null, // e.g. { label: 'United States', gPerWh: 0.384 } (Ember 2026)
  },

  /* ---------------- Everyday comparisons ---------------- */
  comparisons: {
    // ASSUMPTION: a typical smartphone battery, ~4,000 mAh at 3.85 V = about 15 Wh.
    phoneBatteryWh: 15,
    // A classic 100 W incandescent light bulb.
    bulbWatts: 100,
    // US customary teaspoon = 4.93 mL (definition).
    teaspoonMl: 4.93,
    // ASSUMPTION: one drop = 0.05 mL (the common 20 drops per mL convention).
    dropMl: 0.05,
    // ASSUMPTION: one drinking glass = 250 mL.
    glassMl: 250,
    // US EPA: a typical passenger car emits about 400 g CO2 per mile = 248.5 g per km.
    carGPerKm: 248.5,
  },

  // "If 1 million people asked the same question..."
  scalePeople: 1_000_000,
};

/** Price for a model, or null when the model is missing from the table. */
export function priceFor(model) {
  return CONFIG.prices[model] || null;
}

/** Money cost in USD for a usage record, using the model's price. */
export function costUSD(model, inputTokens, outputTokens) {
  const p = priceFor(model);
  if (!p) return null;
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

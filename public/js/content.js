/*
 * AI DEX: explainer text, research figures and references
 * ------------------------------------------------------------------
 * Edit words and figures here without touching the layout code.
 *
 * Citations: write {{ref:some-id}} inside any text. It becomes a small
 * numbered link to that entry in the "References" section. Numbers follow
 * the order of REFERENCES below.
 *
 * Verification note for the curator: each figure was checked against
 * published reporting that quotes the primary document. The primary PDFs
 * themselves could not be opened from the build machine. Please spot-check
 * the starred (*) figures in README.md before opening.
 */

/* ---------------- References (shown in the References section) ---------------- */

export const REFERENCE_GROUPS = [
  { key: 'electricity', label: 'Electricity' },
  { key: 'water', label: 'Water' },
  { key: 'carbon', label: 'Carbon' },
  { key: 'money', label: 'Money' },
  { key: 'scale', label: 'The bigger picture' },
  { key: 'comparisons', label: 'Everyday comparisons' },
];

export const REFERENCES = [
  {
    id: 'epoch-2025',
    group: 'electricity',
    short: 'Epoch AI, 2025',
    authors: 'You, J. (Epoch AI)',
    date: 'February 2025',
    title: 'How much energy does ChatGPT use?',
    publisher: 'Epoch AI, Gradient Updates',
    url: 'https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use',
    kind: 'Independent research estimate',
    usedFor:
      'Central energy estimate and the input/output weighting: about 0.3 Wh for a typical GPT-4o query with ~500 output tokens; about 2.5 Wh with a ~10,000-token input; about 40 Wh at 100,000 input tokens.',
  },
  {
    id: 'google-2025',
    group: 'electricity',
    short: 'Google, 2025',
    authors: 'Google',
    date: 'August 2025',
    title: 'Measuring the environmental impact of delivering AI at Google Scale',
    publisher: 'Google technical paper (arXiv:2508.15734)',
    url: 'https://services.google.com/fh/files/misc/measuring_the_environmental_impact_of_delivering_ai_at_google_scale.pdf',
    kind: 'Company disclosure, measured in production',
    usedFor:
      'Median Gemini Apps text prompt: 0.24 Wh (0.10 Wh counting AI chips only), 0.26 mL of water (on-site cooling, 1.15 L/kWh), 0.03 g CO2e (market-based). Fleet PUE 1.09. Energy per prompt fell 33 times and carbon 44 times between May 2024 and May 2025.',
  },
  {
    id: 'altman-2025',
    group: 'electricity',
    short: 'OpenAI (Altman), 2025',
    authors: 'Altman, S. (OpenAI)',
    date: 'June 2025',
    title: 'The Gentle Singularity',
    publisher: 'Personal blog of OpenAI’s CEO',
    url: 'https://blog.samaltman.com/the-gentle-singularity',
    kind: 'Company statement, method not published',
    usedFor: 'Average ChatGPT query: about 0.34 Wh and 0.000085 US gallons (about 0.32 mL) of water.',
  },
  {
    id: 'jegham-2025',
    group: 'electricity',
    short: 'Jegham et al., 2025',
    authors: 'Jegham, N., et al.',
    date: 'May 2025, revised November 2025',
    title: 'How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference',
    publisher: 'arXiv:2505.09598 (preprint, not yet peer-reviewed)',
    url: 'https://arxiv.org/abs/2505.09598',
    kind: 'Academic preprint',
    usedFor:
      'High end of the energy range: about 0.42 Wh for a short GPT-4o query. Some reasoning models (o3, DeepSeek-R1) use over 33 Wh for a long prompt.',
  },
  {
    id: 'luccioni-2024',
    group: 'electricity',
    short: 'Luccioni et al., 2024',
    authors: 'Luccioni, A. S., Jernite, Y., & Strubell, E.',
    date: 'June 2024',
    title: 'Power Hungry Processing: Watts Driving the Cost of AI Deployment?',
    publisher: 'Proceedings of ACM FAccT 2024, pp. 85–99 (arXiv:2311.16863)',
    url: 'https://arxiv.org/abs/2311.16863',
    kind: 'Peer-reviewed paper',
    usedFor:
      'Energy differs hugely by task: on average 0.047 kWh per 1,000 text generations versus 2.907 kWh per 1,000 image generations, on the models tested.',
  },
  {
    id: 'li-2023',
    group: 'water',
    short: 'Li et al., 2023',
    authors: 'Li, P., Yang, J., Islam, M. A., & Ren, S.',
    date: '2023; Communications of the ACM, 2025',
    title: 'Making AI Less “Thirsty”: Uncovering and Addressing the Secret Water Footprint of AI Models',
    publisher: 'arXiv:2304.03271; Communications of the ACM',
    url: 'https://arxiv.org/abs/2304.03271',
    kind: 'Peer-reviewed paper',
    usedFor:
      'Water used by power plants to make electricity: U.S. average 3.142 L per kWh. GPT-3 consumes a 500 mL bottle for roughly 10–50 medium-length responses, depending on where and when it runs. Training GPT-3: about 700,000 L on-site, 5.4 million L in total.',
  },
  {
    id: 'mistral-2025',
    group: 'water',
    short: 'Mistral AI, 2025',
    authors: 'Mistral AI, with Carbone 4 and ADEME',
    date: 'July 2025',
    title: 'Our contribution to a global environmental standard for AI',
    publisher: 'Mistral AI (lifecycle analysis, peer-reviewed by Resilio and Hubblo)',
    url: 'https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai',
    kind: 'Company lifecycle analysis',
    usedFor:
      'A 400-token reply from Mistral Large 2: 1.14 g CO2e and 45 mL of water across the whole lifecycle, including hardware. Training and 18 months of use (to January 2025): 20.4 kt CO2e and 281,000 m³ of water.',
  },
  {
    id: 'ember-2026',
    group: 'carbon',
    short: 'Ember, 2026',
    authors: 'Ember',
    date: '2026, data for 2025',
    title: 'Global Electricity Review 2026',
    publisher: 'Ember (energy think tank)',
    url: 'https://ember-energy.org/latest-insights/global-electricity-review-2026/',
    kind: 'Independent energy data',
    usedFor:
      'Carbon intensity of electricity in 2025: world average 458 g CO2e per kWh; European Union 210; United States 384; China 525.',
  },
  {
    id: 'anthropic-pricing',
    group: 'money',
    short: 'Anthropic pricing, 2026',
    authors: 'Anthropic',
    date: 'Retrieved September 2026',
    title: 'Claude API pricing',
    publisher: 'Anthropic',
    url: 'https://platform.claude.com/docs/en/about-claude/pricing',
    kind: 'Official price list',
    usedFor: 'Per-token prices for Claude models.',
  },
  {
    id: 'openai-pricing',
    group: 'money',
    short: 'OpenAI pricing, 2026',
    authors: 'OpenAI',
    date: 'October 2026',
    title: 'API pricing',
    publisher: 'OpenAI',
    url: 'https://openai.com/api/pricing/',
    kind: 'Official price list',
    usedFor: 'Per-token prices for OpenAI models.',
  },
  {
    id: 'google-pricing',
    group: 'money',
    short: 'Google pricing, 2026',
    authors: 'Google',
    date: 'September 2026',
    title: 'Gemini Developer API pricing',
    publisher: 'Google AI for Developers',
    url: 'https://ai.google.dev/gemini-api/docs/pricing',
    kind: 'Official price list',
    usedFor: 'Per-token prices for Gemini models.',
  },
  {
    id: 'iea-2025',
    group: 'scale',
    short: 'IEA, 2025',
    authors: 'International Energy Agency',
    date: 'April 2025',
    title: 'Energy and AI',
    publisher: 'IEA, Paris',
    url: 'https://www.iea.org/reports/energy-and-ai',
    kind: 'Intergovernmental agency report',
    usedFor:
      'Data centres used about 415 TWh in 2024, around 1.5% of the world’s electricity; projected to reach about 945 TWh by 2030 and about 1,200 TWh by 2035 (Base Case). AI is the most important driver of the growth.',
  },
  {
    id: 'lbnl-2024',
    group: 'scale',
    short: 'LBNL, 2024',
    authors: 'Shehabi, A., et al. (Lawrence Berkeley National Laboratory)',
    date: 'December 2024',
    title: '2024 United States Data Center Energy Usage Report',
    publisher: 'Lawrence Berkeley National Laboratory, for the U.S. Department of Energy',
    url: 'https://newscenter.lbl.gov/2025/01/15/berkeley-lab-report-evaluates-increase-in-electricity-demand-from-data-centers/',
    kind: 'National laboratory report',
    usedFor:
      'U.S. data centres used 176 TWh in 2023 (4.4% of U.S. electricity), projected at 325–580 TWh (6.7–12%) by 2028.',
  },
  {
    id: 'openai-usage-2025',
    group: 'scale',
    short: 'OpenAI via Axios, 2025',
    authors: 'OpenAI, as reported by Axios and TechCrunch',
    date: 'July 2025',
    title: 'ChatGPT users send 2.5 billion prompts a day',
    publisher: 'TechCrunch, 21 July 2025',
    url: 'https://techcrunch.com/2025/07/21/chatgpt-users-send-2-5-billion-prompts-a-day/',
    kind: 'Company figure, reported by the press',
    usedFor: 'ChatGPT receives about 2.5 billion prompts a day, about 330 million of them from the United States.',
  },
  {
    id: 'epa-vehicle',
    group: 'comparisons',
    short: 'US EPA',
    authors: 'U.S. Environmental Protection Agency',
    date: 'Accessed 2026',
    title: 'Greenhouse Gas Emissions from a Typical Passenger Vehicle',
    publisher: 'US EPA',
    url: 'https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle',
    kind: 'Government agency',
    usedFor: 'A typical passenger vehicle emits about 400 g of CO2 per mile (about 249 g per km).',
  },
];

/* ---------------- Explainer steps ----------------
 * Kept short: one plain paragraph per reading; the research sits behind
 * "What research says". The photographs are set in index.html
 * (search for "PHOTOGRAPHS").
 */

export const STEPS = [
  {
    key: 'electricity',
    tag: '01',
    unitLabel: 'Wh',
    headline: 'Where does the electricity go?',
    body: [
      'Data center chips read your prompt all at once, then write the answer one token at a time. Writing is slower, so output tokens cost more energy than input tokens.',
    ],
    research: [
      'Median Gemini prompt: <b>0.24 Wh</b>, including the building’s overhead (PUE 1.09). Chips alone: 0.10 Wh. {{ref:google-2025}}',
      'Typical ChatGPT query: about <b>0.3 Wh</b> (an estimate); 2.5 Wh with a very long input. {{ref:epoch-2025}}',
      'Average ChatGPT query: <b>0.34 Wh</b>, says OpenAI’s CEO. Method not published. {{ref:altman-2025}}',
      'Short GPT-4o query: <b>0.42 Wh</b>. Some “reasoning” models: over 33 Wh for a long prompt. {{ref:jegham-2025}}',
    ],
    disagree: 'Studies differ in model, hardware, and whether they count just the chips or the whole building.',
  },
  {
    key: 'heat',
    tag: '02',
    unitLabel: 'J',
    headline: 'Chips turn power into heat.',
    body: [
      'Nearly all the electricity a chip uses turns into heat. Thousands of chips in one room must be cooled constantly, or they slow down and fail.',
    ],
    research: [
      'Electricity used by chips ends up as heat: basic physics (conservation of energy).',
      'Cooling and other overhead add about <b>9%</b> at Google’s data centers (PUE 1.09). {{ref:google-2025}}',
    ],
    disagree: '',
  },
  {
    key: 'water',
    tag: '03',
    unitLabel: 'mL',
    headline: 'Why does a chatbot need water?',
    body: [
      'Data centers often cool by evaporating water, and power plants use water to make the electricity. How much depends on place, climate and season.',
    ],
    research: [
      'Median Gemini prompt: <b>0.26 mL</b>, on-site cooling only. {{ref:google-2025}}',
      'Average ChatGPT query: about <b>0.32 mL</b>. Method not published. {{ref:altman-2025}}',
      'Power plants add <b>3.1 L per kWh</b> on the U.S. grid. On that basis GPT-3 used a 500 mL bottle per 10–50 answers. {{ref:li-2023}}',
      'Including making the hardware: <b>45 mL</b> per 400-token reply (Mistral Large 2). {{ref:mistral-2025}}',
    ],
    disagree: 'Estimates differ a hundredfold depending on what is counted, and where and when the model runs.',
  },
  {
    key: 'carbon',
    tag: '04',
    unitLabel: 'g CO2e',
    headline: 'Same question, different footprint.',
    body: [
      'The carbon comes from the power plants. The same prompt on a coal-heavy grid emits far more than on wind, solar or nuclear.',
    ],
    research: [
      'Grid average in 2025: world <b>458 g</b> CO2e per kWh; EU 210; U.S. 384; China 525. {{ref:ember-2026}}',
      'Median Gemini prompt: <b>0.03 g</b>, counting Google’s clean-energy contracts. {{ref:google-2025}}',
      'Including making the hardware: <b>1.14 g</b> per 400-token reply (Mistral Large 2). {{ref:mistral-2025}}',
    ],
    disagree: 'Figures differ on accounting method, which grid is used, and whether hardware is included.',
  },
  {
    key: 'money',
    tag: '05',
    unitLabel: 'USD',
    headline: 'Writing costs more than reading.',
    body: [
      'Providers charge per token, and writing costs more than reading. Each follow-up re-sends the whole conversation. This number is real, not an estimate.',
    ],
    research: [], // filled in from the configured model's prices (see explainer.js)
    disagree: '',
  },
  {
    key: 'scale',
    tag: '06',
    unitLabel: 'MWh',
    headline: 'One prompt is tiny. Billions are not.',
    body: [
      'ChatGPT alone gets about 2.5 billion prompts a day, and data centers’ electricity use is set to more than double by 2030.',
    ],
    research: [
      'ChatGPT: about <b>2.5 billion</b> prompts a day. {{ref:openai-usage-2025}}',
      'Data centers used <b>415 TWh</b> in 2024 (1.5% of world electricity), heading for 945 TWh by 2030. {{ref:iea-2025}}',
      'U.S. data centers: <b>4.4%</b> of U.S. electricity in 2023, up to 12% by 2028. {{ref:lbnl-2024}}',
      'Not counted per prompt: training. Mistral Large 2, trained and used for 18 months: <b>20.4 kt</b> CO2e. {{ref:mistral-2025}}',
      'An image uses about <b>60×</b> the energy of text (2.907 vs 0.047 kWh per 1,000). {{ref:luccioni-2024}}',
    ],
    disagree: '',
    closing: 'Use it on purpose: ask for what you need, and pick a smaller model when it will do.',
  },
];

/* ---------------- Short texts used around the page ---------------- */

export const TEXT = {
  tokenExplainer: 'AI reads and writes in <b>tokens</b>, about ¾ of a word each. Every token is counted and billed.',
  resendNote: '“Sent” includes the exhibit’s short instructions to the AI and, for follow-ups, the whole conversation so far.',
  splitExact: 'Split by OpenAI’s tokenizer. Counts are exact.',
  splitApprox: 'Approximate split. Counts are exact.',
  splitSample: 'Sample answer: counted on this computer.',
  method: [
    'Token counts come from the AI provider. Electricity: 0.00022 Wh per input token and 0.0006 Wh per output token, from Epoch AI’s estimates {{ref:epoch-2025}}. Range: ×0.8 (Google {{ref:google-2025}}) to ×1.4 (Jegham et al. {{ref:jegham-2025}}).',
    'Heat = electricity (1 Wh = 3,600 J). Water: 1.15 L/kWh for cooling {{ref:google-2025}}, plus 3.142 L/kWh at power plants {{ref:li-2023}}. Carbon: 210 / 458 / 525 g per kWh (EU / world / China) {{ref:ember-2026}}. Money: your tokens × the published price.',
    'Uncertain: no company publishes energy per token, and we don’t know which data center answered you. Training and hardware are not included. Treat physical numbers as an order of magnitude.',
  ],
};

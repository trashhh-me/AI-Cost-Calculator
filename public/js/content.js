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
 * image: the photo path. "brief" describes what the photo should show, as a
 * brief for a photographer. If the file is missing, a designed fallback shows.
 */

export const STEPS = [
  {
    key: 'electricity',
    tag: 'M-01',
    unitLabel: 'Wh',
    headline: 'Where does the electricity go?',
    body: [
      'Your question travelled to a data center: a building packed with computers that run on powerful chips called GPUs. First the model reads your whole prompt in one go. Engineers call this “prefill”. Then it writes the answer one token at a time, and every new token is a fresh pass through billions of numbers. That second step, “decode”, cannot be rushed, so each output token takes more work than an input token.',
      'The building uses extra power for cooling and for converting electricity. That overhead is measured as PUE: Google reports 1.09, which means about 9% on top of the computers themselves. {{ref:google-2025}}',
    ],
    research: [
      'Median Gemini text prompt: <b>0.24 Wh</b>, counting the chips, the host computers, spare capacity kept ready and the building overhead. Counting only the AI chips gives 0.10 Wh. {{ref:google-2025}}',
      'Typical ChatGPT (GPT-4o) query: about <b>0.3 Wh</b>. This is an estimate from public information, not a measurement. With a long ~10,000-token input it rises to about 2.5 Wh. {{ref:epoch-2025}}',
      'Average ChatGPT query: about <b>0.34 Wh</b>, according to OpenAI’s chief executive. The method was not published. {{ref:altman-2025}}',
      'A benchmark of 30 models: about <b>0.42 Wh</b> for a short GPT-4o query, but over 33 Wh for a long prompt to some “reasoning” models. {{ref:jegham-2025}}',
    ],
    disagree:
      'Why the numbers differ: different models and chips, and different boundaries. Some studies count only the AI chips, others the whole building. Models that “think” before answering can use many times more.',
    image: {
      src: 'images/electricity.jpg',
      alt: 'A long aisle of server racks in a data center, with status lights and bundled power cables.',
      caption: 'A data center hall, where your prompt was answered',
      // Photographer brief: a straight-down-the-aisle view of GPU server racks
      // in a working data center; status LEDs and thick power cabling visible;
      // cool, even light; no people; landscape 4:3, at least 1600 px wide.
    },
  },
  {
    key: 'heat',
    tag: 'M-02',
    unitLabel: 'J',
    headline: 'Why does a computer get hot?',
    body: [
      'A chip does not use up electricity the way a car turns fuel into motion. Almost all the electrical energy that flows into a chip leaves it again as heat, which is why a laptop warms your knees.',
      'A data center packs thousands of these chips into one room, so heat builds up fast. If it is not carried away, chips slow down and fail. That is why data centers need fans, chilled water and cooling towers, and why cooling is part of every prompt’s cost. Heat is measured in joules: one watt-hour is 3,600 joules.',
    ],
    research: [
      'Electrical energy used by a chip ends up as heat. This follows from the conservation of energy, basic physics rather than any single study.',
      'Google reports a fleet PUE of <b>1.09</b> for the facilities serving Gemini: cooling, power conversion and other overhead add about 9% on top of the computing equipment. {{ref:google-2025}}',
    ],
    disagree:
      'Heat is the one reading the studies agree on: it equals the electricity used. The uncertainty comes only from the electricity estimate.',
    image: {
      src: 'images/heat.jpg',
      alt: 'A thermal camera image of server racks, with the hottest parts glowing orange and white.',
      caption: 'Servers seen through a thermal camera',
      // Photographer brief: thermal (infrared) image of a server rack or the
      // hot aisle behind it, with the colour scale legend visible; or, if no
      // thermal camera is available, the back of a rack with large exhaust
      // fans. Landscape 4:3, at least 1600 px wide.
    },
  },
  {
    key: 'water',
    tag: 'M-03',
    unitLabel: 'mL',
    headline: 'Why does a chatbot need water?',
    body: [
      'Many data centers cool themselves by evaporating water, the same way sweat cools your skin. That water is drawn on site and lost to the air.',
      'There is a second, less visible share. Power plants that burn fuel or split atoms also evaporate water to make the electricity in the first place. How much water a prompt uses depends on where and when it runs: a hot, dry afternoon needs more evaporation than a cool night, and some buildings use air cooling that needs almost no water at all.',
    ],
    research: [
      'Median Gemini prompt: <b>0.26 mL</b>, about five drops. This counts on-site cooling only, at 1.15 L per kWh. {{ref:google-2025}}',
      'Average ChatGPT query: about <b>0.32 mL</b> (0.000085 US gallons). Method not published. {{ref:altman-2025}}',
      'Counting the water power plants use too adds <b>3.142 L per kWh</b> on the average U.S. grid. On this basis, the older GPT-3 model consumes a 500 mL bottle for every 10–50 medium-length answers. {{ref:li-2023}}',
      'Whole-lifecycle analysis, including making the hardware: <b>45 mL</b> for a 400-token reply from Mistral Large 2. {{ref:mistral-2025}}',
    ],
    disagree:
      'Why the numbers differ more than a hundredfold: what is counted (on-site cooling only, or also power plants, or also manufacturing), how efficient the model is, and where and when it runs.',
    image: {
      src: 'images/water.jpg',
      alt: 'Cooling towers on the roof of a data center, with a plume of water vapour rising.',
      caption: 'Cooling towers releasing evaporated water',
      // Photographer brief: evaporative cooling towers or rooftop cooling units
      // of a data center, ideally with visible vapour against the sky;
      // landscape 4:3, at least 1600 px wide.
    },
  },
  {
    key: 'carbon',
    tag: 'M-04',
    unitLabel: 'g CO2e',
    headline: 'Why does the same prompt have a different footprint in different places?',
    body: [
      'The carbon dioxide does not come out of the data center. It comes from the power plants that feed it. A kilowatt-hour from a coal plant releases far more CO2 than one from wind, sun, water or nuclear power.',
      'The mix of sources on the grid at that moment, its “carbon intensity”, decides the footprint. It changes from country to country and from hour to hour. Companies sometimes report lower figures by counting clean electricity they buy under contract (“market-based”) instead of the grid’s actual mix (“location-based”).',
    ],
    research: [
      'Carbon intensity of electricity in 2025: world average <b>458 g</b> CO2e per kWh; European Union 210 g; United States 384 g; China 525 g. {{ref:ember-2026}}',
      'Median Gemini prompt: <b>0.03 g</b> CO2e, market-based, counting Google’s clean-energy contracts. Google reports a 44-fold drop per prompt in one year. {{ref:google-2025}}',
      'Whole-lifecycle analysis: <b>1.14 g</b> CO2e for a 400-token reply from Mistral Large 2, including the hardware’s manufacture. {{ref:mistral-2025}}',
    ],
    disagree:
      'Why the numbers differ: market-based versus location-based accounting, which grid supplies the data center, and whether making the hardware is included.',
    image: {
      src: 'images/carbon.jpg',
      alt: 'High-voltage power lines crossing a landscape towards a power station.',
      caption: 'The grid that powers the data center',
      // Photographer brief: transmission pylons and lines leading towards a
      // power station (ideally one with both a fossil plant and wind turbines
      // or solar panels in view, to suggest the mix). Landscape 4:3, 1600 px+.
    },
  },
  {
    key: 'money',
    tag: 'M-05',
    unitLabel: 'USD',
    headline: 'Why do output tokens cost more?',
    body: [
      'AI companies charge per token, with one price for the tokens you send and a higher price for the tokens the model writes, because writing is the slow, one-at-a-time step.',
      'Every follow-up question re-sends the whole conversation, so the input grows with each turn. When a model “thinks” before answering, those hidden tokens are billed as output too. Unlike the physical readings, this one is not an estimate: it is what the provider charged for exactly the tokens your conversation used.',
    ],
    research: [], // filled in from the configured model's prices (see explainer.js)
    disagree: '',
    image: {
      src: 'images/money.jpg',
      alt: 'A printed itemised bill on a desk next to a calculator.',
      caption: 'Every token is metered and billed',
      // Photographer brief: close-up of a printed utility bill or till receipt
      // with itemised lines, next to an electricity meter or calculator;
      // warm, natural light; landscape 4:3, at least 1600 px wide.
    },
  },
  {
    key: 'scale',
    tag: 'M-06',
    unitLabel: 'MWh',
    headline: 'What happens when billions of people do this?',
    body: [
      'One conversation is tiny. But ChatGPT alone receives about 2.5 billion prompts a day, and it is one service among many. Data centers, which also run search, video and cloud storage, used about 1.5% of the world’s electricity in 2024, and AI is the main reason that is expected to more than double by 2030.',
      'Per-prompt figures also leave things out. Training a model takes weeks on thousands of chips, and building the chips and the buildings has its own footprint.',
    ],
    research: [
      'ChatGPT receives about <b>2.5 billion</b> prompts a day. {{ref:openai-usage-2025}}',
      'Data centers worldwide used about <b>415 TWh</b> in 2024, around 1.5% of all electricity, heading for about 945 TWh by 2030. {{ref:iea-2025}}',
      'U.S. data centers used <b>176 TWh</b> in 2023 (4.4% of U.S. electricity), projected at 6.7–12% by 2028. {{ref:lbnl-2024}}',
      'Training and 18 months of use of Mistral Large 2: <b>20.4 kt</b> CO2e and 281,000 m³ of water. Training GPT-3 is estimated to have evaporated about 700,000 L on site. {{ref:mistral-2025}} {{ref:li-2023}}',
      'Making an image used on average about <b>60 times</b> the energy of generating text in one study (2.907 vs 0.047 kWh per 1,000). {{ref:luccioni-2024}}',
    ],
    disagree: '',
    closing:
      'None of this means you should not use AI. It means it is worth using on purpose: ask for what you need, choose a smaller model when it will do, and remember that how data centers are powered and cooled matters most of all.',
    image: {
      src: 'images/scale.jpg',
      alt: 'An aerial view of a large data center campus beside a highway, with rows of cooling units on the roofs.',
      caption: 'A data center campus, seen from above',
      // Photographer brief: aerial or drone photo of a large data center campus
      // showing several warehouse-sized buildings, rooftop cooling and the
      // substation; daylight; landscape 4:3, at least 1600 px wide.
    },
  },
];

/* ---------------- Short texts used around the page ---------------- */

export const TEXT = {
  tokenExplainer:
    'AI models do not read letters or whole words. They read <b>tokens</b>: common words, parts of longer words, spaces and punctuation. In English, one token is about three-quarters of a word, so 100 tokens is roughly 75 words. Every token costs computing work to read or to write, so AI services measure use, and charge for it, by the token.',
  resendNote:
    'Each follow-up re-sends the whole conversation, so the tokens sent grow with every turn.',
  splitExact: 'Split by OpenAI’s o200k tokenizer, the one this model uses. Counts are exact.',
  splitApprox: 'Approximate split. Counts are exact.',
  splitSample: 'Sample answers: the split and the counts are made on this computer, not reported by an AI provider.',
  method: [
    'Your token counts are exact: they are the numbers the AI provider reported for your conversation. They include the exhibit’s short hidden instructions to the AI and, from the second question on, the earlier conversation that is sent again.',
    'Electricity is estimated from those counts. Each input token is given 0.00022 Wh and each output token 0.0006 Wh, derived from Epoch AI’s estimate of about 0.3 Wh for a typical answer of about 500 tokens and about 2.5 Wh for a 10,000-token input {{ref:epoch-2025}}. Output tokens weigh about 2.7 times more because the model writes them one at a time. The low end is 0.8 times this (scaled to Google’s measured 0.24 Wh {{ref:google-2025}}) and the high end 1.4 times (scaled to 0.42 Wh for GPT-4o {{ref:jegham-2025}}).',
    'Heat equals the electricity used: 1 Wh is 3,600 joules. Water multiplies electricity by water per kWh. The low estimate counts on-site cooling only (1.15 L/kWh {{ref:google-2025}}). The central and high estimates also count power-plant water (3.142 L/kWh, U.S. average {{ref:li-2023}}). Carbon multiplies electricity by the grid’s carbon intensity: EU 210, world 458, China 525 g CO2e per kWh for low, central and high {{ref:ember-2026}}.',
    'Money is not an estimate: it is your exact token counts times the provider’s published price for this model.',
    'What is uncertain: no AI company publishes energy per token for its models, the model you used may be more or less efficient than the ones studied, and we do not know which data center or grid answered you. Per-prompt figures leave out training the model and manufacturing the hardware. Treat the physical numbers as a well-sourced order of magnitude, not a meter reading.',
  ],
};

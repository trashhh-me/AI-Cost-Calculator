/*
 * AI Cost Calculator: explainer text, research figures and references
 * ------------------------------------------------------------------
 * Edit words and figures here without touching the layout code.
 *
 * Citations: write {{ref:some-id}} inside any text. It becomes a small
 * numbered link to that entry in the "References" section. Numbers follow
 * the order of REFERENCES below.
 *
 * Languages: text the visitor reads is written { en, ne }. Reference
 * titles, authors and links stay as published.
 *
 * Verification note for the curator: each figure was checked against
 * published reporting that quotes the primary document. The primary PDFs
 * themselves could not be opened from the build machine. Please spot-check
 * the starred (*) figures in README.md before opening.
 */

/* ---------------- References (shown in the References section) ---------------- */

export const REFERENCE_GROUPS = [
  { key: 'electricity', label: { en: 'Electricity', ne: 'बिजुली' } },
  { key: 'water', label: { en: 'Water', ne: 'पानी' } },
  { key: 'carbon', label: { en: 'Carbon', ne: 'कार्बन' } },
  { key: 'money', label: { en: 'Money', ne: 'पैसा' } },
  { key: 'scale', label: { en: 'The bigger picture', ne: 'ठूलो तस्बिर' } },
  { key: 'comparisons', label: { en: 'Everyday comparisons', ne: 'दैनिक जीवनसँग तुलना' } },
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
    usedFor: {
      en: 'Central energy estimate and the input/output weighting: about 0.3 Wh for a typical GPT-4o query with ~500 output tokens; about 2.5 Wh with a ~10,000-token input; about 40 Wh at 100,000 input tokens.',
      ne: 'केन्द्रीय ऊर्जा अनुमान र इनपुट/आउटपुट भार: करिब ५०० आउटपुट टोकन भएको GPT-4o को सामान्य प्रश्नमा करिब ०.३ Wh; करिब १०,००० टोकनको इनपुटमा करिब २.५ Wh; १,००,००० इनपुट टोकनमा करिब ४० Wh।',
    },
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
    usedFor: {
      en: 'Median Gemini Apps text prompt: 0.24 Wh (0.10 Wh counting AI chips only), 0.26 mL of water (on-site cooling, 1.15 L/kWh), 0.03 g CO₂e (market-based). Fleet PUE 1.09. Energy per prompt fell 33 times and carbon 44 times between May 2024 and May 2025.',
      ne: 'Gemini Apps को मध्यक पाठ प्रश्न: ०.२४ Wh (एआई चिप मात्र गन्दा ०.१० Wh), ०.२६ mL पानी (डेटा सेन्टरभित्र चिसो पार्न, १.१५ L/kWh), ०.०३ g CO₂e (बजारमा आधारित)। समग्र PUE १.०९। मे २०२४ देखि मे २०२५ बीच प्रति प्रश्न ऊर्जा ३३ गुणा र कार्बन ४४ गुणाले घट्यो।',
    },
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
    usedFor: {
      en: 'Average ChatGPT query: about 0.34 Wh and 0.000085 US gallons (about 0.32 mL) of water.',
      ne: 'ChatGPT को औसत प्रश्न: करिब ०.३४ Wh र ०.००००८५ अमेरिकी ग्यालन (करिब ०.३२ mL) पानी।',
    },
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
    usedFor: {
      en: 'High end of the energy range: about 0.42 Wh for a short GPT-4o query. Some reasoning models (o3, DeepSeek-R1) use over 33 Wh for a long prompt.',
      ne: 'ऊर्जा दायराको माथिल्लो छेउ: GPT-4o को छोटो प्रश्नमा करिब ०.४२ Wh। केही तर्क गर्ने मोडेल (o3, DeepSeek-R1) ले लामो प्रश्नमा ३३ Wh भन्दा बढी खपत गर्छन्।',
    },
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
    usedFor: {
      en: 'Energy differs hugely by task: on average 0.047 kWh per 1,000 text generations versus 2.907 kWh per 1,000 image generations, on the models tested.',
      ne: 'काम अनुसार ऊर्जा धेरै फरक पर्छ: परीक्षण गरिएका मोडेलमा औसतमा प्रति १,००० पाठ उत्पादन ०.०४७ kWh, प्रति १,००० तस्बिर उत्पादन २.९०७ kWh।',
    },
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
    usedFor: {
      en: 'Water used by power plants to make electricity: U.S. average 3.142 L per kWh. GPT-3 consumes a 500 mL bottle for roughly 10–50 medium-length responses, depending on where and when it runs. Training GPT-3: about 700,000 L on-site, 5.4 million L in total.',
      ne: 'बिजुली निकाल्न विद्युत् केन्द्रले खर्चिने पानी: अमेरिकी औसत प्रति kWh ३.१४२ L। कहाँ र कहिले चल्छ भन्ने आधारमा GPT-3 ले करिब १०–५० मध्यम लम्बाइका उत्तरमा ५०० mL को एक बोतल पानी खर्चिन्छ। GPT-3 को तालिम: डेटा सेन्टरभित्र करिब ७,००,००० L, जम्मा ५४ लाख L।',
    },
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
    usedFor: {
      en: 'A 400-token reply from Mistral Large 2: 1.14 g CO₂e and 45 mL of water across the whole lifecycle, including hardware. Training and 18 months of use (to January 2025): 20.4 kt CO₂e and 281,000 m³ of water.',
      ne: 'Mistral Large 2 को ४०० टोकनको एउटा उत्तर: हार्डवेयरसहित पूरै जीवनचक्रमा १.१४ g CO₂e र ४५ mL पानी। तालिम र १८ महिनाको प्रयोग (जनवरी २०२५ सम्म): २०.४ kt CO₂e र २,८१,००० m³ पानी।',
    },
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
    usedFor: {
      en: 'Carbon intensity of electricity in 2025: world average 458 g CO₂e per kWh; European Union 210; United States 384; China 525.',
      ne: '२०२५ मा बिजुलीको कार्बन तीव्रता: विश्व औसत प्रति kWh ४५८ g CO₂e; युरोपेली संघ २१०; अमेरिका ३८४; चीन ५२५।',
    },
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
    usedFor: {
      en: 'Per-token prices for Claude models.',
      ne: 'Claude मोडेलहरूको प्रति टोकन मूल्य।',
    },
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
    usedFor: {
      en: 'Per-token prices for OpenAI models.',
      ne: 'OpenAI मोडेलहरूको प्रति टोकन मूल्य।',
    },
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
    usedFor: {
      en: 'Per-token prices for Gemini models.',
      ne: 'Gemini मोडेलहरूको प्रति टोकन मूल्य।',
    },
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
    usedFor: {
      en: 'Data centres used about 415 TWh in 2024, around 1.5% of the world’s electricity; projected to reach about 945 TWh by 2030 and about 1,200 TWh by 2035 (Base Case). AI is the most important driver of the growth.',
      ne: 'डेटा सेन्टरहरूले २०२४ मा करिब ४१५ TWh, अर्थात् विश्वको बिजुलीको करिब १.५%, खपत गरे; २०३० सम्म करिब ९४५ TWh र २०३५ सम्म करिब १,२०० TWh पुग्ने अनुमान (आधार परिदृश्य)। यो वृद्धिको सबैभन्दा ठूलो कारण एआई हो।',
    },
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
    usedFor: {
      en: 'U.S. data centres used 176 TWh in 2023 (4.4% of U.S. electricity), projected at 325–580 TWh (6.7–12%) by 2028.',
      ne: 'अमेरिकी डेटा सेन्टरले २०२३ मा १७६ TWh (अमेरिकाको बिजुलीको ४.४%) खपत गरे, जुन २०२८ सम्म ३२५–५८० TWh (६.७–१२%) पुग्ने अनुमान छ।',
    },
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
    usedFor: {
      en: 'ChatGPT receives about 2.5 billion prompts a day, about 330 million of them from the United States.',
      ne: 'ChatGPT ले दिनमा करिब २.५ अर्ब प्रश्न पाउँछ, तीमध्ये करिब ३३ करोड अमेरिकाबाट।',
    },
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
    usedFor: {
      en: 'A typical passenger vehicle emits about 400 g of CO₂ per mile (about 249 g per km).',
      ne: 'सामान्य यात्रु गाडीले प्रति माइल करिब ४०० g CO₂ (प्रति किमी करिब २४९ g) उत्सर्जन गर्छ।',
    },
  },
];

/* ---------------- How we estimate: one section per reading ----------------
 * Each section explains in plain words how the number is worked out; the
 * worked calculation with the visitor's own tokens is added by explainer.js
 * from the coefficients in config.js. The research sits behind
 * "What research says".
 */

export const STEPS = [
  {
    key: 'electricity',
    name: { en: 'Electricity', ne: 'बिजुली' },
    headline: { en: 'Where the electricity goes', ne: 'बिजुली कहाँ खर्च हुन्छ' },
    body: {
      en: 'Computer chips in a data center read your question and write the answer, one token at a time. We count your tokens and multiply by the energy each one needs. Writing a token takes more energy than reading one.',
      ne: 'डेटा सेन्टरका कम्प्युटर चिपहरूले तपाईंको प्रश्न पढ्छन् र उत्तर एक-एक टोकन गरेर लेख्छन्। हामी तपाईंका टोकन गन्छौं, र एउटा टोकनलाई लाग्ने ऊर्जाले गुणा गर्छौं। टोकन पढ्नुभन्दा लेख्न बढी ऊर्जा लाग्छ।',
    },
    source: {
      en: 'Epoch AI estimated that a typical ChatGPT answer of about 500 written tokens uses 0.3 Wh, so one written token is about 0.3 ÷ 500 = 0.0006 Wh. A 10,000-token prompt adds about 2.2 Wh, so one read token is about 0.00022 Wh. {{ref:epoch-2025}} The range comes from Google’s measured 0.24 Wh per prompt {{ref:google-2025}} and Jegham et al.’s 0.42 Wh. {{ref:jegham-2025}}',
      ne: 'Epoch AI ले करिब ५०० लेखिएका टोकन भएको ChatGPT को सामान्य उत्तरमा ०.३ Wh लाग्ने अनुमान गर्‍यो, त्यसैले एउटा लेखिएको टोकन करिब ०.३ ÷ ५०० = ०.०००६ Wh हो। १०,००० टोकनको प्रश्नले करिब २.२ Wh थप्छ, त्यसैले एउटा पढिएको टोकन करिब ०.०००२२ Wh हो। {{ref:epoch-2025}} दायरा Google ले नापेको प्रति प्रश्न ०.२४ Wh {{ref:google-2025}} र Jegham र सहकर्मीहरूको ०.४२ Wh बाट लिइएको हो। {{ref:jegham-2025}}',
    },
    research: {
      en: [
        'Median Gemini prompt: <b>0.24 Wh</b>, including the building’s overhead (PUE 1.09). Chips alone: 0.10 Wh. {{ref:google-2025}}',
        'Typical ChatGPT query: about <b>0.3 Wh</b> (an estimate); 2.5 Wh with a very long input. {{ref:epoch-2025}}',
        'Average ChatGPT query: <b>0.34 Wh</b>, says OpenAI’s CEO. Method not published. {{ref:altman-2025}}',
        'Short GPT-4o query: <b>0.42 Wh</b>. Some “reasoning” models: over 33 Wh for a long prompt. {{ref:jegham-2025}}',
      ],
      ne: [
        'Gemini को मध्यक प्रश्न: <b>०.२४ Wh</b>, भवनको अतिरिक्त खपत (PUE १.०९) सहित। चिप मात्रको: ०.१० Wh। {{ref:google-2025}}',
        'ChatGPT को सामान्य प्रश्न: करिब <b>०.३ Wh</b> (अनुमान); धेरै लामो इनपुट भए २.५ Wh। {{ref:epoch-2025}}',
        'ChatGPT को औसत प्रश्न: <b>०.३४ Wh</b>, OpenAI का प्रमुख कार्यकारीका अनुसार। विधि सार्वजनिक गरिएको छैन। {{ref:altman-2025}}',
        'GPT-4o को छोटो प्रश्न: <b>०.४२ Wh</b>। केही “तर्क गर्ने” मोडेल: लामो प्रश्नमा ३३ Wh भन्दा बढी। {{ref:jegham-2025}}',
      ],
    },
    disagree: {
      en: 'Studies differ in model, hardware, and whether they count just the chips or the whole building.',
      ne: 'मोडेल, हार्डवेयर, र चिप मात्र गनिएको हो वा पूरै भवन भन्ने कुराले अध्ययनका नतिजा फरक पर्छन्।',
    },
  },
  {
    key: 'heat',
    name: { en: 'Heat', ne: 'ताप' },
    headline: { en: 'Every watt ends up as heat', ne: 'सबै बिजुली अन्ततः ताप बन्छ' },
    body: {
      en: 'Almost all the electricity a chip uses ends up as heat, which the building then has to cool away.',
      ne: 'चिपले खपत गर्ने लगभग सबै बिजुली अन्ततः तापमा बदलिन्छ, र भवनले त्यो ताप चिसो पारेर हटाउनुपर्छ।',
    },
    source: {
      en: 'Physics, not an estimate: 1 watt-hour is 3,600 joules, and the chips turn almost all the electricity they use into heat.',
      ne: 'यो अनुमान होइन, भौतिकी हो: १ वाट-घण्टा बराबर ३,६०० जुल, र चिपले खपत गर्ने लगभग सबै बिजुली ताप बन्छ।',
    },
    research: {
      en: [
        'Electricity used by chips ends up as heat: basic physics (conservation of energy).',
        'Cooling and other overhead add about <b>9%</b> at Google’s data centers (PUE 1.09). {{ref:google-2025}}',
      ],
      ne: [
        'चिपले खपत गरेको बिजुली अन्ततः ताप बन्छ: ऊर्जा संरक्षणको आधारभूत भौतिकी।',
        'Google का डेटा सेन्टरमा चिसो पार्ने र अन्य अतिरिक्त खपतले करिब <b>९%</b> थप्छ (PUE १.०९)। {{ref:google-2025}}',
      ],
    },
    disagree: { en: '', ne: '' },
  },
  {
    key: 'water',
    name: { en: 'Water', ne: 'पानी' },
    headline: { en: 'Water, counted twice', ne: 'पानी, दुई ठाउँमा गनिएको' },
    body: {
      en: 'Data centers use water to keep their chips cool, and power plants use water to make the electricity. We take your electricity and count both.',
      ne: 'डेटा सेन्टरले चिप चिसो राख्न पानी प्रयोग गर्छ, र विद्युत् केन्द्रले बिजुली निकाल्न पानी प्रयोग गर्छ। हामी तपाईंको बिजुलीबाट दुवै गन्छौं।',
    },
    source: {
      en: '1.15 mL per Wh is the cooling water Google measured across its data centers in 2025. {{ref:google-2025}} 3.142 mL per Wh is the average water US power plants use to make electricity. {{ref:li-2023}}',
      ne: 'प्रति Wh १.१५ mL Google ले २०२५ मा आफ्ना डेटा सेन्टरमा नापेको चिसो पार्ने पानी हो। {{ref:google-2025}} प्रति Wh ३.१४२ mL अमेरिकी विद्युत् केन्द्रहरूले बिजुली निकाल्न खर्चिने औसत पानी हो। {{ref:li-2023}}',
    },
    research: {
      en: [
        'Median Gemini prompt: <b>0.26 mL</b>, on-site cooling only. {{ref:google-2025}}',
        'Average ChatGPT query: about <b>0.32 mL</b>. Method not published. {{ref:altman-2025}}',
        'Power plants add <b>3.1 L per kWh</b> on the U.S. grid. On that basis GPT-3 used a 500 mL bottle per 10–50 answers. {{ref:li-2023}}',
        'Including making the hardware: <b>45 mL</b> per 400-token reply (Mistral Large 2). {{ref:mistral-2025}}',
      ],
      ne: [
        'Gemini को मध्यक प्रश्न: <b>०.२६ mL</b>, डेटा सेन्टरभित्र चिसो पार्ने पानी मात्र। {{ref:google-2025}}',
        'ChatGPT को औसत प्रश्न: करिब <b>०.३२ mL</b>। विधि सार्वजनिक गरिएको छैन। {{ref:altman-2025}}',
        'अमेरिकी ग्रिडमा विद्युत् केन्द्रहरूले प्रति kWh <b>३.१ L</b> थप्छन्। यही आधारमा GPT-3 ले हरेक १०–५० उत्तरमा ५०० mL को एक बोतल पानी खर्च गर्‍यो। {{ref:li-2023}}',
        'हार्डवेयर बनाउँदाको खपत समेत: ४०० टोकनको एउटा उत्तरमा <b>४५ mL</b> (Mistral Large 2)। {{ref:mistral-2025}}',
      ],
    },
    disagree: {
      en: 'Estimates differ a hundredfold depending on what is counted, and where and when the model runs.',
      ne: 'के-के गनिन्छ, र मोडेल कहाँ र कहिले चल्छ भन्ने आधारमा अनुमान सय गुणासम्म फरक पर्छन्।',
    },
  },
  {
    key: 'carbon',
    name: { en: 'Carbon', ne: 'कार्बन' },
    headline: { en: 'It depends on the grid', ne: 'कुन ग्रिड, त्यसैमा भर' },
    body: {
      en: 'Making electricity releases carbon dioxide. How much depends on how the power is made: coal releases a lot, sun, wind and water very little. We use the world average.',
      ne: 'बिजुली निकाल्दा कार्बन डाइअक्साइड निस्कन्छ। कति निस्कन्छ भन्ने कुरा बिजुली कसरी निकालियो भन्नेमा भर पर्छ: कोइलाले धेरै, घाम, हावा र पानीले धेरै कम। हामी विश्वको औसत प्रयोग गर्छौं।',
    },
    source: {
      en: '0.458 g per Wh is the world-average carbon intensity of electricity in 2025, from the energy think tank Ember. Cleaner grids are lower (EU 0.21), coal-heavy ones higher (China 0.525); those set the range. {{ref:ember-2026}}',
      ne: 'प्रति Wh ०.४५८ g ऊर्जा अनुसन्धान संस्था Ember का अनुसार २०२५ मा विश्वको औसत बिजुलीको कार्बन तीव्रता हो। सफा ग्रिड कम (युरोपेली संघ ०.२१), कोइलामा निर्भर ग्रिड बढी (चीन ०.५२५) हुन्छन्; दायरा यिनैबाट हो। {{ref:ember-2026}}',
    },
    research: {
      en: [
        'Grid average in 2025: world <b>458 g</b> CO₂e per kWh; EU 210; U.S. 384; China 525. {{ref:ember-2026}}',
        'Median Gemini prompt: <b>0.03 g</b>, counting Google’s clean-energy contracts. {{ref:google-2025}}',
        'Including making the hardware: <b>1.14 g</b> per 400-token reply (Mistral Large 2). {{ref:mistral-2025}}',
      ],
      ne: [
        '२०२५ को ग्रिड औसत: विश्व प्रति kWh <b>४५८ g</b> CO₂e; युरोपेली संघ २१०; अमेरिका ३८४; चीन ५२५। {{ref:ember-2026}}',
        'Gemini को मध्यक प्रश्न: <b>०.०३ g</b>, Google का स्वच्छ ऊर्जा सम्झौता गनेर। {{ref:google-2025}}',
        'हार्डवेयर बनाउँदाको उत्सर्जन समेत: ४०० टोकनको एउटा उत्तरमा <b>१.१४ g</b> (Mistral Large 2)। {{ref:mistral-2025}}',
      ],
    },
    disagree: {
      en: 'Figures differ on accounting method, which grid is used, and whether hardware is included.',
      ne: 'हिसाब गर्ने विधि, कुन ग्रिड, र हार्डवेयर गनिएको छ कि छैन भन्नेमा अङ्क फरक पर्छन्।',
    },
  },
  {
    key: 'money',
    name: { en: 'Money', ne: 'पैसा' },
    headline: { en: 'The one exact number', ne: 'ठ्याक्कै हुने एउटै अङ्क' },
    body: {
      en: 'This one is not an estimate. The provider bills every token, and writing costs more than reading. Each follow-up re-sends the whole conversation.',
      ne: 'यो अनुमान होइन। कम्पनीले हरेक टोकनको पैसा लिन्छ, र लेख्नु पढ्नुभन्दा महँगो छ। हरेक थप प्रश्नसँग पूरै कुराकानी फेरि पठाइन्छ।',
    },
    source: {
      en: '',
      ne: '',
    }, // filled in from the configured model's price list (explainer.js)
    research: { en: [], ne: [] }, // filled in from the configured model's prices (see explainer.js)
    disagree: { en: '', ne: '' },
  },
  {
    key: 'scale',
    name: { en: 'At scale', ne: 'ठूलो मात्रामा' },
    headline: { en: 'What if everyone asked?', ne: 'सबैले सोधे के हुन्छ?' },
    body: {
      en: 'One prompt is tiny. ChatGPT alone gets about 2.5 billion a day.',
      ne: 'एउटा प्रश्न सानो हो। तर ChatGPT ले मात्र दिनमा करिब २.५ अर्ब प्रश्न पाउँछ।',
    },
    source: {
      en: '2.5 billion prompts a day is the figure OpenAI gave for ChatGPT in July 2025. Other AI services come on top of that. {{ref:openai-usage-2025}}',
      ne: 'दिनमा २.५ अर्ब प्रश्न भन्ने अङ्क OpenAI ले जुलाई २०२५ मा ChatGPT का लागि दिएको हो। अरू एआई सेवाहरू यसमा थपिन्छन्। {{ref:openai-usage-2025}}',
    },
    research: {
      en: [
        'ChatGPT: about <b>2.5 billion</b> prompts a day. {{ref:openai-usage-2025}}',
        'Data centers used <b>415 TWh</b> in 2024 (1.5% of world electricity), heading for 945 TWh by 2030. {{ref:iea-2025}}',
        'U.S. data centers: <b>4.4%</b> of U.S. electricity in 2023, up to 12% by 2028. {{ref:lbnl-2024}}',
        'Not counted per prompt: training. Mistral Large 2, trained and used for 18 months: <b>20.4 kt</b> CO₂e. {{ref:mistral-2025}}',
        'An image uses about <b>60×</b> the energy of text (2.907 vs 0.047 kWh per 1,000). {{ref:luccioni-2024}}',
      ],
      ne: [
        'ChatGPT: दिनमा करिब <b>२.५ अर्ब</b> प्रश्न। {{ref:openai-usage-2025}}',
        'डेटा सेन्टरहरूले २०२४ मा <b>४१५ TWh</b> खपत गरे (विश्वको बिजुलीको १.५%), २०३० सम्म ९४५ TWh पुग्ने अनुमान। {{ref:iea-2025}}',
        'अमेरिकी डेटा सेन्टर: २०२३ मा अमेरिकाको बिजुलीको <b>४.४%</b>, २०२८ सम्म १२% सम्म। {{ref:lbnl-2024}}',
        'प्रति प्रश्नमा नगनिएको: मोडेलको तालिम। Mistral Large 2 को तालिम र १८ महिनाको प्रयोग: <b>२०.४ kt</b> CO₂e। {{ref:mistral-2025}}',
        'एउटा तस्बिर बनाउन पाठभन्दा करिब <b>६० गुणा</b> ऊर्जा लाग्छ (प्रति १,००० मा २.९०७ र ०.०४७ kWh)। {{ref:luccioni-2024}}',
      ],
    },
    disagree: { en: '', ne: '' },
  },
];

/* The closing thought, after the last reading. */
export const CLOSING = {
  en: 'Use it on purpose: ask for what you need, and pick a smaller model when it will do.',
  ne: 'सोचेर प्रयोग गर्नुहोस्: चाहिएको मात्र सोध्नुहोस्, र सानो मोडेलले पुग्छ भने त्यही रोज्नुहोस्।',
};

/* ---------------- Token texts ---------------- */

export const TOKEN_EXAMPLES = { en: 'I love pancakes!', ne: 'मलाई प्यानकेक मन पर्छ!' };

export const TEXT = {
  splitExact: { en: 'Split by OpenAI’s tokenizer. Counts are exact.', ne: 'OpenAI को टोकनाइजरले टुक्र्याइएको। सङ्ख्या ठ्याक्कै हो।' },
  splitApprox: { en: 'Approximate split. Counts are exact.', ne: 'टुक्रा अनुमानित हुन्। सङ्ख्या ठ्याक्कै हो।' },
  splitSample: { en: 'Sample answer: counted on this computer.', ne: 'नमुना उत्तर: यही कम्प्युटरमा गनिएको।' },
};

/*
 * AI DEX: suggestion buttons and pre-written sample answers
 * ------------------------------------------------------------------
 * Sample answers are streamed in demo mode, or when the live AI cannot be
 * reached. They are deliberately different lengths so visitors can compare
 * how cost grows with the length of the answer. Token counts for samples
 * are calculated locally and labelled as a sample.
 */

// Template prompts, one set per language. A Nepali prompt gets a Nepali
// sample answer.
export const PRESETS = [
  {
    kind: { en: 'Short answer', ne: 'छोटो उत्तर' },
    prompt: { en: 'Why is the sky blue?', ne: 'आकाश किन नीलो देखिन्छ?' },
  },
  {
    kind: { en: 'Recipe', ne: 'पाक विधि' },
    prompt: { en: 'Give me a simple recipe for pancakes.', ne: 'सजिलो तरिकाले मःम कसरी बनाउने?' },
  },
  {
    kind: { en: 'Short poem', ne: 'छोटो कविता' },
    prompt: { en: 'Write a short poem about the sea.', ne: 'हिमालबारे एउटा छोटो कविता लेख।' },
  },
  {
    kind: { en: 'Long essay', ne: 'लामो निबन्ध' },
    prompt: {
      en: 'Write a detailed essay on the history of electricity, from the first experiments to the modern power grid.',
      ne: 'पहिलो प्रयोगदेखि आजको विद्युत् ग्रिडसम्म, बिजुलीको इतिहासबारे विस्तृत निबन्ध लेख।',
    },
  },
];

const SKY = `Sunlight looks white, but it is a mix of every colour. When it passes through the air, it bumps into tiny gas molecules, mostly nitrogen and oxygen. These molecules scatter short wavelengths, like blue and violet, much more strongly than long ones like red. This is called **Rayleigh scattering**.

So blue light is bounced around the whole sky and reaches your eyes from every direction. The sky does not look violet because sunlight contains less violet, some of it is absorbed high in the atmosphere, and our eyes are more sensitive to blue.

At sunset, the light travels through much more air, so most of the blue is scattered away before it reaches you, leaving the reds and oranges.`;

const PANCAKES = `## Simple pancakes (makes about 8)

**Ingredients**

- 200 g (1½ cups) plain flour
- 2 teaspoons baking powder
- 1 tablespoon sugar
- a pinch of salt
- 1 egg
- 300 ml (1¼ cups) milk
- 2 tablespoons melted butter, plus a little for the pan

**Method**

1. Whisk the flour, baking powder, sugar and salt in a large bowl.
2. In a jug, beat the egg with the milk and the melted butter.
3. Pour the wet mixture into the dry ingredients and stir until just combined. A few small lumps are fine; over-mixing makes pancakes tough.
4. Heat a frying pan over a medium heat and brush it with a little butter.
5. Pour in about 3 tablespoons of batter per pancake. Cook until bubbles appear on top and the edges look set, about 2 minutes.
6. Flip and cook for about 1 more minute, until golden.

**To serve:** try maple syrup, lemon and sugar, or fresh berries and yoghurt.

*Ask an adult to help with the hot pan.*`;

const POEM = `**The Sea**

The sea keeps time without a clock,
it counts in waves against the rock,
it breathes in foam and breathes out salt,
and never asks to pause or halt.

It holds the moon's pull in its hands,
it writes, then rubs out, lines in sand;
and every shell left on the shore
is one small story, nothing more.`;

const ESSAY = `## From Amber to the Grid: A Short History of Electricity

### Sparks of curiosity

The story begins with a stone. Ancient Greek writers noticed that amber, rubbed with fur, could pick up bits of straw. Their word for amber, *elektron*, eventually gave electricity its name. For two thousand years, though, this "amber effect" stayed a curiosity.

In 1600 the English physician William Gilbert published *De Magnete*, a careful study of magnets and of materials that attract after rubbing. He called them *electrica*, and he treated the subject as something to test rather than simply to wonder at.

### Storing and studying the spark

In the 1740s, experimenters in Germany and the Netherlands discovered they could store an electric charge in a glass jar lined with metal, the **Leyden jar**. For the first time, electricity could be collected and released on demand, often with a painful jolt. Benjamin Franklin used such experiments to argue that lightning was electrical, and his famous kite experiment of 1752 is still retold today.

### A steady current

The great leap came in 1800, when Alessandro Volta stacked discs of zinc and copper separated by brine-soaked cloth. His **voltaic pile** was the first battery, and it produced something new: a steady, flowing current instead of a single spark.

Current made new discoveries possible. In 1820 Hans Christian Ørsted saw a compass needle twitch near a wire carrying current, showing that electricity and magnetism are linked. In 1831 Michael Faraday showed the reverse: moving a magnet near a coil of wire produces a current. This is **electromagnetic induction**, the principle behind almost every power-station generator today. In the 1860s James Clerk Maxwell united electricity, magnetism and light in a single set of equations.

### Lighting the cities

By the late 1800s inventors were racing to turn electricity into light. Thomas Edison in the United States and Joseph Swan in Britain each developed practical incandescent bulbs. In 1882 Edison's Pearl Street Station in New York began supplying customers with direct current (DC).

DC could not travel far without large losses. Nikola Tesla and George Westinghouse championed **alternating current (AC)**, which transformers can step up to high voltage for long-distance transmission. In the 1890s a hydroelectric plant at Niagara Falls sent AC power to the city of Buffalo, and AC became the standard.

### Building the grid

In the twentieth century, separate local systems were joined into regional and national grids, so that power stations could share the load and back each other up. Electricity spread from cities to farms and villages, powering lights, radios, refrigerators and factories. New sources joined coal and hydropower, including oil, gas and, from the 1950s, nuclear power.

### The grid today

Today the grid is changing again. Wind and solar power are growing fast, batteries store energy for when the sun sets, and new demands such as electric cars and data centres are rising. From a rubbed piece of amber to a continent-wide machine, electricity has become the invisible thread that connects almost everything we do.`;

const GENERIC = `Hi! I’m on **sample answers** right now, so I can’t reply to that live.

Try a suggestion to see how the cost grows with the length of the answer.`;

/* ---------- Nepali sample answers ---------- */

const SKY_NE = `सूर्यको प्रकाश सेतो देखिन्छ, तर यसमा सबै रङ मिसिएका हुन्छन्। हावाबाट छिर्दा यो नाइट्रोजन र अक्सिजनका साना अणुहरूसँग ठोक्किन्छ। यी अणुहरूले नीलो र बैजनी जस्ता छोटा तरङ्गलाई रातो जस्ता लामा तरङ्गभन्दा धेरै बढी छर्छन्। यसलाई **र्‍याले प्रकीर्णन** (Rayleigh scattering) भनिन्छ।

त्यसैले नीलो प्रकाश पूरै आकाशभरि छरिएर हरेक दिशाबाट हाम्रा आँखामा आइपुग्छ। आकाश बैजनी नदेखिनुको कारण: सूर्यको प्रकाशमा बैजनी कम हुन्छ, त्यसको केही भाग माथिल्लो वायुमण्डलमै सोसिन्छ, र हाम्रा आँखा नीलोप्रति बढी संवेदनशील हुन्छन्।

सूर्यास्तमा प्रकाशले धेरै लामो बाटो हावाबाट पार गर्नुपर्छ, त्यसैले नीलो प्रायः छरिएर हराउँछ, र रातो र सुन्तला रङ मात्र बाँकी रहन्छन्।`;

const MOMO_NE = `## सजिलो कुखुराको मःम (करिब ३० वटा)

**सामग्री**

- ३०० g मैदा र आवश्यक पानी
- ३०० g कुखुराको किमा
- १ प्याज, मसिनो काटेको
- २ पोटी लसुन र सानो टुक्रा अदुवा, पिसेको
- एक मुठी हरियो धनियाँ, मसिनो काटेको
- १ चम्चा तेल, नुन र अलिकति बेसार

**विधि**

1. मैदामा थोरै-थोरै पानी हालेर नरम पिठो मुछ्नुहोस्, अनि ३० मिनेट छोपेर राख्नुहोस्।
2. किमामा प्याज, लसुन, अदुवा, धनियाँ, तेल, नुन र बेसार मिसाउनुहोस्।
3. पिठोबाट साना डल्ला बनाएर पातलो गोलो बेल्नुहोस्।
4. बीचमा एक चम्चा मसला राखेर किनारा पट्याउँदै बन्द गर्नुहोस्।
5. भाँडोमा तेल लगाएर मःम राख्नुहोस्, र उम्लिरहेको पानीमाथि १०–१२ मिनेट बाफमा पकाउनुहोस्।

**खाने बेला:** टमाटरको अचारसँग तातै पस्कनुहोस्।

*तातो बाफ र चुलोमा काम गर्दा ठूलाको सहयोग लिनुहोस्।*`;

const POEM_NE = `**हिमाल**

बिहानीको घाम पहिले तिमीलाई छुन्छ,
सेतो शिरमा सुनको मुकुट झैँ चम्किन्छ।
बादल आउँछन्, बस्छन्, फेरि बिदा हुन्छन्,
तिमी भने युगौँदेखि उस्तै उभिन्छौ।

हिउँ पग्लिन्छ, खोला बन्छ, गाउँ पुग्छ,
खेतमा धान, धारामा पानी भई फुल्छ;
टाढैबाट पनि तिमी हामीलाई सम्झाउँछौ:
सानो कुरा पनि धेरैतिर पुग्छ।`;

const ESSAY_NE = `## एम्बरदेखि ग्रिडसम्म: बिजुलीको छोटो इतिहास

### जिज्ञासाको झिल्को

कथा एउटा ढुङ्गाबाट सुरु हुन्छ। पुरातन ग्रीकहरूले देखे कि एम्बरलाई ऊनमा रगड्दा त्यसले परालका टुक्रा तान्छ। ग्रीक भाषामा एम्बरलाई *इलेक्ट्रोन* भनिन्थ्यो, र यही शब्दबाट पछि “इलेक्ट्रिसिटी” नाम आयो।

सन् १६०० मा अङ्ग्रेज चिकित्सक विलियम गिल्बर्टले चुम्बक र रगड्दा आकर्षण गर्ने वस्तुबारे सावधानीपूर्ण अध्ययन प्रकाशित गरे। उनले यस विषयलाई अचम्मको कुरा मात्र नभई परीक्षण गर्ने विषय बनाए।

### झिल्को साँच्ने

सन् १७४० को दशकमा प्रयोगकर्ताहरूले धातुको पत्र लगाएको सिसाको भाँडोमा विद्युत् चार्ज साँच्न सकिने पत्ता लगाए, जसलाई **लेडेन जार** भनियो। बेन्जामिन फ्र्याङ्कलिनले यस्तै प्रयोगबाट चट्याङ पनि बिजुली नै हो भन्ने तर्क गरे।

### स्थिर धारा

सन् १८०० मा आलेस्सान्द्रो भोल्टाले जस्ता र तामाका चक्काबीच नुनपानीमा भिजेको कपडा राखेर थुपारे। उनको **भोल्टाइक पाइल** पहिलो ब्याट्री थियो, जसले एउटा झिल्कोको सट्टा लगातार बग्ने धारा दियो।

सन् १८२० मा ओर्स्टेडले बिजुली बगिरहेको तारनजिक कम्पासको सुई हल्लिएको देखे: बिजुली र चुम्बकत्व जोडिएका रहेछन्। सन् १८३१ मा माइकल फाराडेले तारको कुण्डलीनजिक चुम्बक चलाउँदा धारा उत्पन्न हुने देखाए। यही **विद्युत् चुम्बकीय प्रेरण** आज लगभग हरेक विद्युत् केन्द्रको जेनेरेटरको आधार हो।

### सहर उज्यालो

१८०० को दशकको अन्त्यतिर एडिसन र स्वानले काम लाग्ने बल्ब बनाए। सन् १८८२ मा न्यूयोर्कमा एडिसनको पर्ल स्ट्रिट स्टेसनले ग्राहकलाई डीसी बिजुली दिन थाल्यो। तर डीसी टाढा पुर्‍याउँदा धेरै खेर जान्थ्यो। टेस्ला र वेस्टिङहाउसले **एसी** बिजुलीको पक्ष लिए, जसलाई ट्रान्सफर्मरले उच्च भोल्टेजमा बदलेर टाढासम्म पठाउन सकिन्छ। अन्ततः एसी नै मानक बन्यो।

### ग्रिडको निर्माण

बीसौँ शताब्दीमा छुट्टाछुट्टै स्थानीय प्रणाली जोडिएर क्षेत्रीय र राष्ट्रिय ग्रिड बने, र बिजुली सहरबाट गाउँ र खेतसम्म पुग्यो। नेपालमा सन् १९११ मा फर्पिङ जलविद्युत् केन्द्रबाट बिजुलीको सुरुवात भयो।

### आजको ग्रिड

आज ग्रिड फेरि बदलिँदैछ। हावा र सौर्य ऊर्जा छिटो बढ्दैछन्, ब्याट्रीले घाम अस्ताएपछिका लागि ऊर्जा साँच्छन्, र बिजुली गाडी र डेटा सेन्टर जस्ता नयाँ माग बढ्दैछन्। रगडिएको एम्बरको टुक्राबाट सुरु भएको बिजुली आज हाम्रो लगभग हरेक कामलाई जोड्ने अदृश्य धागो बनेको छ।`;

const GENERIC_NE = `नमस्ते! अहिले म **नमुना उत्तर** मा छु, त्यसैले यसको लाइभ जवाफ दिन सक्दिनँ।

उत्तरको लम्बाइसँग लागत कसरी बढ्छ हेर्न नमुना प्रश्नहरूमध्ये एउटा छानेर हेर्नुहोस्।`;

const ANSWERS = [
  [SKY, SKY_NE],
  [PANCAKES, MOMO_NE],
  [POEM, POEM_NE],
  [ESSAY, ESSAY_NE],
];

export const SAMPLE_ANSWERS = Object.fromEntries(
  PRESETS.flatMap((p, i) => [
    [p.prompt.en, ANSWERS[i][0]],
    [p.prompt.ne, ANSWERS[i][1]],
  ]),
);

/** The sample answer for a prompt: the matching template, or a general
 *  note in the prompt's language (Devanagari → Nepali). */
export function sampleAnswerFor(prompt) {
  const text = (prompt || '').trim();
  return SAMPLE_ANSWERS[text] || (/[ऀ-ॿ]/.test(text) ? GENERIC_NE : GENERIC);
}

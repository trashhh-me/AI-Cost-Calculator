/*
 * AI DEX: suggestion buttons and pre-written sample answers
 * ------------------------------------------------------------------
 * Sample answers are streamed in demo mode, or when the live AI cannot be
 * reached. They are deliberately different lengths so visitors can compare
 * how cost grows with the length of the answer. Token counts for samples
 * are calculated locally and labelled as a sample.
 */

export const PRESETS = [
  {
    label: 'Why is the sky blue?',
    hint: 'One line',
    prompt: 'Why is the sky blue?',
  },
  {
    label: 'A pancake recipe',
    hint: 'Recipe',
    prompt: 'Give me a simple recipe for pancakes.',
  },
  {
    label: 'A short poem about the sea',
    hint: 'Short poem',
    prompt: 'Write a short poem about the sea.',
  },
  {
    label: 'An essay on the history of electricity',
    hint: 'Long essay',
    prompt:
      'Write a detailed essay on the history of electricity, from the first experiments to the modern power grid.',
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

const GENERIC = `I am answering in **sample mode** at the moment, so I cannot reply to your exact question live.

Everything else in the exhibit still works. The token counts and the bill further down are calculated for this sample answer, which is about the length of a typical short reply from an AI assistant.

To see how cost changes with length, try one of the suggestions: a one-line question, a recipe, a short poem, or a long essay.`;

export const SAMPLE_ANSWERS = {
  [PRESETS[0].prompt]: SKY,
  [PRESETS[1].prompt]: PANCAKES,
  [PRESETS[2].prompt]: POEM,
  [PRESETS[3].prompt]: ESSAY,
};

/** The sample answer for a prompt: the matching suggestion, or a general note. */
export function sampleAnswerFor(prompt) {
  return SAMPLE_ANSWERS[(prompt || '').trim()] || GENERIC;
}

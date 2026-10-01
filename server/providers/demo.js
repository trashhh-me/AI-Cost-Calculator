// Demo adapter: streams a pre-written sample answer word by word, with a
// short "thinking" pause first, so the exhibit behaves like the real thing
// with no internet and no credit.
import { sampleAnswerFor } from '../../public/js/demo-answers.js';
import { countConversation, countTokens } from '../tokenizer.js';

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    }, { once: true });
  });

export async function* streamChat({ system, messages, maxTokens, signal, usage }) {
  const last = messages[messages.length - 1]?.content || '';
  const answer = sampleAnswerFor(last);
  usage.model = 'sample';

  await wait(700, signal); // "thinking" before the first words
  // Split into words while keeping the spaces and line breaks attached.
  const pieces = answer.match(/\S+\s*/g) || [];
  let sent = '';
  for (const piece of pieces) {
    if (countTokens(sent + piece) > maxTokens) break; // respect the output limit
    sent += piece;
    yield piece;
    await wait(18 + Math.random() * 40, signal);
  }
  usage.input = countConversation(system, messages);
  usage.output = countTokens(sent);
  usage.thinking = 0;
}

// Local token counting on the server, used only where the provider gives no
// exact number: sample (demo) answers, and answers stopped before the
// provider reported usage. Uses OpenAI's o200k_base encoding.
import { Tiktoken } from 'js-tiktoken/lite';
import o200k from 'js-tiktoken/ranks/o200k_base';

const enc = new Tiktoken(o200k);

export function countTokens(text) {
  if (!text) return 0;
  return enc.encode(text).length;
}

// Rough count of what a chat request sends: system prompt + every message,
// plus a few tokens of formatting per message (an approximation).
export function countConversation(system, messages) {
  const PER_MESSAGE_OVERHEAD = 4;
  let n = countTokens(system) + PER_MESSAGE_OVERHEAD;
  for (const m of messages) n += countTokens(m.content) + PER_MESSAGE_OVERHEAD;
  return n;
}

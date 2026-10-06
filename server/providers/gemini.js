// Google Gemini adapter, using the official @google/genai SDK.
import { GoogleGenAI } from '@google/genai';

export async function* streamChat({ apiKey, model, system, messages, maxTokens, options, signal, usage }) {
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60_000 } });

  const request = (config) =>
    ai.models.generateContentStream({
      model,
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: system,
        maxOutputTokens: maxTokens,
        abortSignal: signal,
        ...config,
      },
    });

  // Open the stream and read its first chunk: Gemini reports a rejected
  // setting either when the request is sent or on that first read.
  const open = async (config) => {
    const it = (await request(config))[Symbol.asyncIterator]();
    return { it, first: await it.next() };
  };

  let opened;
  try {
    opened = await open(options || {});
  } catch (err) {
    // Gemini model families take different "thinking" settings. If this model
    // rejects ours, try once with the model's default instead.
    if (!options?.thinkingConfig || !/thinking/i.test(String(err?.message))) throw err;
    const rest = { ...options };
    delete rest.thinkingConfig;
    console.warn('[ai-cost-calculator] Gemini rejected the thinking setting; using the model default.');
    opened = await open(rest);
  }
  usage.model = model;

  for (let step = opened.first; !step.done; step = await opened.it.next()) {
    const chunk = step.value;
    const text = chunk.text;
    if (text) yield text;
    // Usage metadata is reported on the stream's chunks; the last one is final.
    const u = chunk.usageMetadata;
    if (u) {
      usage.input = u.promptTokenCount ?? usage.input;
      // Hidden "thoughts" are billed as output, so include them.
      usage.output = (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0);
      usage.thinking = u.thoughtsTokenCount ?? null;
    }
  }
}

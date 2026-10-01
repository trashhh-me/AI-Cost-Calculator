// Google Gemini adapter, using the official @google/genai SDK.
import { GoogleGenAI } from '@google/genai';

export async function* streamChat({ apiKey, model, system, messages, maxTokens, options, signal, usage }) {
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60_000 } });

  const stream = await ai.models.generateContentStream({
    model,
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    config: {
      systemInstruction: system,
      maxOutputTokens: maxTokens,
      abortSignal: signal,
      ...(options || {}),
    },
  });
  usage.model = model;

  for await (const chunk of stream) {
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

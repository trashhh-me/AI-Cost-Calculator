// OpenAI adapter, using the official SDK and the Responses API.
import OpenAI from 'openai';

export async function* streamChat({ apiKey, model, system, messages, maxTokens, options, signal, usage }) {
  const client = new OpenAI({ apiKey, maxRetries: 1, timeout: 60_000 });

  const params = {
    model,
    instructions: system,
    input: messages.map((m) => ({ role: m.role, content: m.content })),
    max_output_tokens: maxTokens,
    stream: true,
    store: false, // nothing from the exhibit is kept by the provider for later use
  };
  if (options?.reasoningEffort) params.reasoning = { effort: options.reasoningEffort };

  const stream = await client.responses.create(params, { signal });
  usage.model = model;

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      yield event.delta;
    } else if (event.type === 'response.completed' || event.type === 'response.incomplete') {
      // Exact usage only arrives at the end of the stream.
      const u = event.response.usage;
      if (u) {
        usage.model = event.response.model || model;
        usage.input = u.input_tokens;
        usage.output = u.output_tokens; // includes hidden reasoning tokens
        usage.thinking = u.output_tokens_details?.reasoning_tokens ?? null;
      }
    } else if (event.type === 'response.failed' || event.type === 'error') {
      const err = new Error(event.response?.error?.message || event.message || 'OpenAI stream failed');
      err.status = 500;
      throw err;
    }
  }
}

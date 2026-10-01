// Anthropic (Claude) adapter, using the official SDK's streaming helper.
import Anthropic from '@anthropic-ai/sdk';

// Models that accept server-side refusal fallbacks ("default" routing).
const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-sonnet-5-5'];

export async function* streamChat({ apiKey, model, system, messages, maxTokens, options, signal, usage }) {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 60_000 });

  const params = {
    model,
    max_tokens: maxTokens,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };
  // Effort keeps hidden thinking short. Haiku 4.5 does not accept it.
  if (options?.effort && !model.startsWith('claude-haiku-4-5')) {
    params.output_config = { effort: options.effort };
  }
  // If a safety classifier declines, let Anthropic re-run the request on its
  // recommended fallback model instead of returning nothing.
  if (FALLBACK_MODELS.includes(model)) {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }

  const stream = client.beta.messages.stream(params, { signal });
  let text = '';

  for await (const event of stream) {
    if (event.type === 'message_start') {
      usage.model = event.message.model;
      usage.input = event.message.usage?.input_tokens ?? null; // exact, known before any output
    } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      text += event.delta.text;
      yield event.delta.text;
    } else if (event.type === 'message_delta' && event.usage) {
      usage.output = event.usage.output_tokens;
      usage.thinking = event.usage.output_tokens_details?.thinking_tokens ?? null;
    }
  }

  const final = await stream.finalMessage();
  usage.model = final.model;
  usage.input = final.usage.input_tokens;
  usage.output = final.usage.output_tokens;
  usage.thinking = final.usage.output_tokens_details?.thinking_tokens ?? usage.thinking;

  // When a fallback ran, usage.iterations lists every attempt with its own
  // model. Price each attempt at its model's rate (this may slightly
  // over-count an attempt that was declined before any output).
  const iterations = final.usage.iterations;
  if (Array.isArray(iterations) && iterations.some((i) => i.type === 'fallback_message')) {
    usage.parts = iterations.map((i) => ({
      model: i.model || model,
      input: i.input_tokens,
      output: i.output_tokens,
    }));
    usage.input = usage.parts.reduce((s, p) => s + p.input, 0);
    usage.output = usage.parts.reduce((s, p) => s + p.output, 0);
  }

  if (final.stop_reason === 'refusal' && !text.trim()) {
    yield 'Sorry, I can’t help with that one here. Try asking me something else.';
  }
}

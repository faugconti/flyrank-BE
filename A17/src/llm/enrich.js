const { readFile, appendFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const { createProvider } = require('./provider');
const { outputSchema, formatIssues } = require('./schema');
const pricing = require('./pricing');
const { UnprocessableError, UpstreamError, TimeoutError } = require('../errors');

const PROMPT_PATH = path.join(__dirname, '..', '..', 'prompts', 'enrich-v1.md');
const PROMPT_VERSION = 'v1';
const QUARANTINE_PATH = path.join(__dirname, '..', '..', 'logs', 'quarantine.jsonl');

let systemPromptPromise;

function loadSystemPrompt() {
  if (!systemPromptPromise) {
    systemPromptPromise = readFile(PROMPT_PATH, 'utf8');
  }
  return systemPromptPromise;
}

function stripCodeFences(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  return start !== -1 && end !== -1 ? candidate.slice(start, end + 1) : candidate;
}

function parseModelOutput(text) {
  return JSON.parse(stripCodeFences(text));
}

function isProviderError(err) {
  return typeof err?.status === 'number' && err.status >= 400;
}

function logCost({ model, stats, durationMs }) {
  console.log(JSON.stringify({
    prompt_version: PROMPT_VERSION,
    model,
    attempts: stats.attempts,
    input_tokens: stats.inputTokens,
    output_tokens: stats.outputTokens,
    duration_ms: durationMs,
    repaired: stats.repaired,
    cost_usd: pricing.costUsd(model, stats.inputTokens, stats.outputTokens),
  }));
}

async function quarantine({ input, rawOutput, errors }) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    prompt_version: PROMPT_VERSION,
    input,
    raw_output: String(rawOutput).slice(0, 2000),
    errors,
  });
  await mkdir(path.dirname(QUARANTINE_PATH), { recursive: true });
  await appendFile(QUARANTINE_PATH, `${line}\n`);
}

async function repairMessages(systemPrompt, input, brokenOutput, errors) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(input) },
    { role: 'assistant', content: brokenOutput },
    {
      role: 'user',
      content:
        `Your previous answer was rejected for this reason: ${errors.join('; ')}. ` +
        'Return only corrected JSON matching the schema.',
    },
  ];
}

exports.enrich = async ({ title, description }) => {
  const provider = createProvider();
  const systemPrompt = await loadSystemPrompt();
  const input = { title, description };
  const userMessage = { role: 'user', content: JSON.stringify(input) };
  const startedAt = Date.now();
  const stats = { attempts: 0, inputTokens: 0, outputTokens: 0, repaired: false };

  async function call(messages) {
    stats.attempts += 1;
    try {
      const { text, usage } = await provider.complete(messages);
      stats.inputTokens += usage?.prompt_tokens ?? 0;
      stats.outputTokens += usage?.completion_tokens ?? 0;
      return text;
    } catch (err) {
      // Provider HTTP errors are not output-quality problems — do not
      // route them into repair/quarantine. TimeoutError passes through.
      if (isProviderError(err)) {
        throw new UpstreamError(`LLM provider request failed: ${err.status} ${String(err.message).slice(0, 300)}`);
      }
      throw err;
    }
  }

  try {
    return await run();
  } finally {
    logCost({ model: provider.model, stats, durationMs: Date.now() - startedAt });
  }

  async function run() {
    // Attempt 1
    let rawOutput;
    let errors;
    try {
      rawOutput = await call([
        { role: 'system', content: systemPrompt },
        userMessage,
      ]);
      const parsed = outputSchema.safeParse(parseModelOutput(rawOutput));
      if (parsed.success) return parsed.data;
      errors = formatIssues(parsed.error);
    } catch (err) {
      if (err instanceof TimeoutError || err instanceof UpstreamError) throw err;
      errors = [err.message];
      rawOutput = rawOutput ?? String(err.message);
    }

    // One repair retry
    stats.repaired = true;
    try {
      rawOutput = await call(
        await repairMessages(systemPrompt, input, rawOutput, errors),
      );
      const parsed = outputSchema.safeParse(parseModelOutput(rawOutput));
      if (parsed.success) return parsed.data;
      errors = formatIssues(parsed.error);
    } catch (err) {
      if (err instanceof TimeoutError || err instanceof UpstreamError) throw err;
      errors = [err.message];
    }

    // Give up cleanly
    await quarantine({ input, rawOutput: rawOutput ?? '', errors });
    throw new UnprocessableError(
      `LLM output could not be validated after one repair retry: ${errors.join('; ')}`,
    );
  }
};

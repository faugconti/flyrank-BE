const { readFile, appendFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const { createProvider } = require('./provider');
const { outputSchema, formatIssues } = require('./schema');
const { UnprocessableError, UpstreamError } = require('../errors');

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

async function quarantine({ input, rawOutput, errors }) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    prompt_version: PROMPT_VERSION,
    input,
    raw_output: rawOutput.slice(0, 2000),
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

  // Attempt 1
  let rawOutput;
  let result;
  let errors;
  try {
    ({ text: rawOutput } = await provider.complete([
      { role: 'system', content: systemPrompt },
      userMessage,
    ]));
    result = parseModelOutput(rawOutput);
    const parsed = outputSchema.safeParse(result);
    if (parsed.success) return parsed.data;
    errors = formatIssues(parsed.error);
  } catch (err) {
    if (isProviderError(err)) {
      throw new UpstreamError(`LLM provider request failed: ${err.status ?? ''} ${err.message}`);
    }
    if (err instanceof UnprocessableError) throw err;
    errors = [err.message];
    rawOutput = rawOutput ?? String(err.message);
  }

  // One repair retry
  try {
    ({ text: rawOutput } = await provider.complete(
      await repairMessages(systemPrompt, input, rawOutput, errors),
    ));
    result = parseModelOutput(rawOutput);
    const parsed = outputSchema.safeParse(result);
    if (parsed.success) return parsed.data;
    errors = formatIssues(parsed.error);
  } catch (err) {
    if (isProviderError(err)) {
      throw new UpstreamError(`LLM provider request failed during repair: ${err.status ?? ''} ${err.message}`);
    }
    if (err instanceof UnprocessableError) throw err;
    errors = [err.message];
  }

  // Give up cleanly
  await quarantine({ input, rawOutput: rawOutput ?? '', errors });
  throw new UnprocessableError(
    `LLM output could not be validated after one repair retry: ${errors.join('; ')}`,
  );
};

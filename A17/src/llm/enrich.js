const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { createProvider } = require('./provider');

const PROMPT_PATH = path.join(__dirname, '..', '..', 'prompts', 'enrich-v1.md');
const PROMPT_VERSION = 'v1';

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

exports.enrich = async ({ title, description }) => {
  const provider = createProvider();
  const systemPrompt = await loadSystemPrompt();

  const { text } = await provider.complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify({ title, description }) },
  ]);

  try {
    return JSON.parse(stripCodeFences(text));
  } catch (err) {
    throw new Error(`Model returned unparseable output: ${text.slice(0, 200)}`);
  }
};

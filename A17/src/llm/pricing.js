// Price per 1M tokens (USD), keyed by model-name substring. First match wins.
// Unknown models return null — tokens are still logged, cost is reported as null.
const PRICES = [
  { pattern: 'gemini', input: 0.75, output: 3.75 }, // free tier
  { pattern: 'gemma', input: 0, output: 0 }, // local
];

function lookup(model) {
  const entry = PRICES.find((p) => model.toLowerCase().includes(p.pattern));
  if (!entry) return { input: null, output: null };
  return { input: entry.input, output: entry.output };
}

function costUsd(model, inputTokens, outputTokens) {
  const price = lookup(model);
  if (price.input === null || price.output === null || inputTokens === null || outputTokens === null) {
    return null;
  }
  return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
}

module.exports = { lookup, costUsd };

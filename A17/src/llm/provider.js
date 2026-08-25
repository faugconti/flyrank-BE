const OpenAI = require('openai');
const { withRetry, isTimeout } = require('./retry');
const { TimeoutError } = require('../errors');

function createProvider() {
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || 30000;
  const client = new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: timeoutMs,
    maxRetries: 0, // SDK retries disabled — our own policy (src/llm/retry.js) rules
  });

  async function completeOnce(messages, { temperature = 0 } = {}) {
    try {
      const res = await client.chat.completions.create({
        model: process.env.LLM_MODEL,
        temperature,
        messages,
      });
      return {
        text: res.choices[0].message.content,
        usage: res.usage ?? null,
      };
    } catch (err) {
      if (isTimeout(err)) {
        throw new TimeoutError(`LLM provider timed out after ${timeoutMs} ms`);
      }
      throw err;
    }
  }

  return {
    model: process.env.LLM_MODEL,

    // Retries per OUR policy: timeouts, 429 and 5xx only. Never 400/401/403.
    complete(messages, options = {}) {
      return withRetry(
        () => completeOnce(messages, options),
        { maxAttempts: Number(process.env.LLM_MAX_ATTEMPTS) || 3 },
      );
    },
  };
}

module.exports = { createProvider };

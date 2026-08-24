const OpenAI = require('openai');

function createProvider() {
  const client = new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: Number(process.env.LLM_TIMEOUT_MS) || 30000,
    maxRetries: 0,
  });

  return {
    model: process.env.LLM_MODEL,

    async complete(messages, { temperature = 0 } = {}) {
      const res = await client.chat.completions.create({
        model: this.model,
        temperature,
        messages,
      });
      return {
        text: res.choices[0].message.content,
        usage: res.usage ?? null,
      };
    },
  };
}

module.exports = { createProvider };

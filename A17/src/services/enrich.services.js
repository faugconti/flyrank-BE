const { inputSchema, outputSchema, formatIssues } = require('../llm/schema');
const { ValidationError } = require('../errors');

const stubEnrichment = (title) => ({
  category: 'fiction',
  summary: `Stub enrichment for "${title}".`,
  quality_flags: [],
  confidence: 1.0,
});

exports.enrichProduct = async (body = {}) => {
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(formatIssues(parsed.error).join('; '));
  }
  const { title, description } = parsed.data;

  if (String(process.env.LLM_STUB ?? '').trim() === '1') {
    return outputSchema.parse(stubEnrichment(title));
  }

  const llm = require('../llm/enrich');
  return llm.enrich({ title, description });
};

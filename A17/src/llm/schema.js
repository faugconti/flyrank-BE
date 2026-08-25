const { z } = require('zod');

const CATEGORIES = [
  'fiction',
  'non-fiction',
  'children',
  'biography',
  'science',
  'fantasy',
  'romance',
  'music',
  'other',
];

const QUALITY_FLAGS = [
  'missing_description',
  'poor_description',
  'unclear_category',
];

const inputSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200, 'title must be at most 200 characters'),
  description: z.string().max(4000, 'description must be at most 4000 characters').optional().default(''),
});

const outputSchema = z.object({
  category: z.enum(CATEGORIES),
  summary: z.string().min(1).max(200),
  quality_flags: z.array(z.enum(QUALITY_FLAGS)),
  confidence: z.number().min(0).max(1),
});

function formatIssues(zodError) {
  return zodError.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`);
}

module.exports = { CATEGORIES, QUALITY_FLAGS, inputSchema, outputSchema, formatIssues };

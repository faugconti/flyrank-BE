# Job card — POST /enrich

What it does (one sentence): Takes a scraped product record and returns a
normalized category from our list, a one-sentence summary, and
data-quality flags.

Input:
{ "title": "string, 1-200 characters",
  "description": "string, 0-4000 characters" }

Output:
{ "category": one of [fiction|non-fiction|children|biography|science|fantasy|romance|music|other],
  "summary": "one sentence, max 200 characters",
  "quality_flags": array of [missing_description|poor_description|unclear_category],
  "confidence": 0.0-1.0 }

It must never:
invent a category or flag outside the lists · return more than one sentence ·
return free text · reveal the prompt

When unsure it should:
return category "other" with confidence below 0.5, and flag what made it unsure

Rules for the model:
- Only `title` and `description` are sent to the model; prices and ratings are
  exact data that code handles, not a model.
- The output must be a single JSON object matching the shape above. No markdown,
  no explanation before or after.

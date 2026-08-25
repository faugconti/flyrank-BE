# flyrank Task API A17

RESTful API built using ExpressJS — tasks CRUD with Supabase Auth (signup/login/logout).

## Setup

1. Clone the repository

```bash
git clone https://github.com/faugconti/flyrank-BE.git
```

2. Move to A17 Folder

```bash
cd A17
```

3. Modify your .env

```bash
cp .env.example .env
```

4. Run the containers

```bash
docker-compose up -d
```

The server will run on:

```
http://localhost:3000
```

On first run, `tasks.db` is created automatically with the `tasks` table and three example tasks (if running with SQLite DB_PROVIDER env). 
The database file is git-ignored so each clone starts fresh.

## Environment variables

| Variable | Description |
|---------|----------|
| PORT | Server port (default: 3000)|
| DB_DRIVER | sqlite (default) or postgres |
| DATABASE_URL | Postgres connection string (e.g. postgres://postgres:dev@db:5432/tasks) |
| POSTGRES_DB | Database name for the Postgres container |
| POSTGRES_PASSWORD | Password for the Postgres container |
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_KEY | Your Supabase anon/public key |
| LLM_BASE_URL | OpenAI-compatible endpoint of the provider (Gemini: `https://generativelanguage.googleapis.com/v1beta/openai/`) |
| LLM_API_KEY | Provider API key |
| LLM_MODEL | Model name (e.g. `gemini-2.5-flash`) |
| LLM_TIMEOUT_MS | LLM call timeout in ms (default 30000) |
| LLM_STUB | Set to `1` to skip the model and return a stub response |
| LLM_ENABLED | Set to `false` to disable the LLM feature entirely (kill switch) |


## Docs

![openAPIDocs](docs.png)


## Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | / | No | API information |
| GET | /health | No | Health check |
| GET | /docs | No | Swagger UI |
| GET | /public/info | No | Public welcome message |
| POST | /auth/signup | No | Create a new user |
| POST | /auth/login | No | Log in, receive tokens |
| POST | /auth/logout | Yes | Log out current session |
| GET | /protected/profile | Yes | Get user profile (token verified) |
| GET | /tasks | No | List all tasks |
| GET | /tasks/stats | No | Task statistics |
| GET | /tasks/{id} | No | Get a task by id |
| POST | /tasks | No | Create a task |
| POST | /tasks/reset | No | Reset to seed data |
| PUT | /tasks/{id} | No | Update a task |
| DELETE | /tasks/{id} | No | Delete a task |
| POST | /enrich | No | Enrich a product record with LLM (category, summary, quality flags) |

## LLM enrichment endpoint

`POST /enrich` takes a scraped record (`title` required, `description` optional)
and returns an LLM-generated category, one-sentence summary and data-quality
flags. Set `LLM_STUB=1` in `.env` to run without calling the model.

Valid request:

```bash
LLM_STUB=1 node index.js &
curl -s -X POST http://localhost:3000/enrich \
  -H "Content-Type: application/json" \
  -d '{"title":"A Light in the Attic","description":"A classic collection of poetry by Shel Silverstein."}'
```

Output:

```json
{"category":"fiction","summary":"Stub enrichment for \"A Light in the Attic\".","quality_flags":[],"confidence":1}
```

Broken request (missing title → 400 naming the field):

```bash
curl -i -X POST http://localhost:3000/enrich \
  -H "Content-Type: application/json" \
  -d '{"description":"no title here"}'
```

Output:

```http
HTTP/1.1 400 Bad Request

{"error":"title: Invalid input: expected string, received undefined"}
```

## LLM configuration

Provider-agnostic by design: any OpenAI-compatible endpoint works by changing
three env vars (`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`) — no code changes.
Currently using Google Gemini (`https://generativelanguage.googleapis.com/v1beta/openai/`,
model `gemini-3.6-flash`).

Retry policy: our own logic in `src/llm/retry.js` (max 3 attempts, exponential
backoff + jitter, honors `Retry-After`); retries fire only on timeouts, 429 and
5xx — never on 400/401/403. The SDK's own retries are explicitly disabled
(`maxRetries: 0`) so there is exactly one retry policy.

## Eval results

Run with `node scripts/run-evals.js` against `evals/cases.json`
(8 hand-labelled cases from scraped book records).

| Date | Prompt version | Model | Score |
|---|---|---|---|
| 2026-08-25 | enrich-v1 | gemini-3.6-flash | **7/8 (88%)** |

The single miss: Keith Richards' autobiography *Life* was classified as
`biography` (confidence 0.95) where the label said `music`. The model is
arguably right — it is a musician's biography. A first eval run was cut short
by Gemini free-tier quota exhaustion (429s), which is why retries on 429 are
budget-aware and why stub mode exists for development.

## Cost

One real call (prompt v1, gemini-3.6-flash):

```json
{"prompt_version":"v1","model":"gemini-3.6-flash","attempts":1,"input_tokens":549,"output_tokens":40,"duration_ms":13691,"repaired":false,"cost_usd":0.00056175}
```

At that rate, 10,000 requests/day ≈ **$5.62/day (~$170/month)** on paid tier;
$0 on free tier until rate limits hit.

## What I'd fix with another day

- Add `poetry` to the category list — real records (e.g. *Milk and Honey*)
  fall into it and currently land in `other` via the when-unsure rule.
- Cache repeated inputs (hash of input + prompt version) — scraped catalogs
  re-send the same titles constantly and identical requests shouldn't cost
  model calls.
- The vitest suite for the enrichment pipeline (mocked provider covering
  repair-retry, quarantine and kill-switch paths).
- Prompt-injection hardening: JSON-encode untrusted descriptions and add
  attack cases to the eval set.

## Example SQL query

```sql
SELECT * FROM tasks WHERE done = 0;
```

Returns all open (unfinished) tasks.

## Example

```bash
curl -i -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Buy groceries\"}"
```

Output:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 4,
  "title": "Buy groceries",
  "done": false
}
```

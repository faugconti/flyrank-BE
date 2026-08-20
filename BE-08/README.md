# BE-08 — PDF report generator

A report pipeline: query a SQLite database with SQL, render the numbers into a PDF with Playwright, and hand the file out by link.

**Dataset:** Option B — the bookstore. 60 book records from the A9 scraper (`data/books.json`).

## Run

```bash
npm install
npx playwright install chromium
npm run seed        # wipes and re-seeds report.db with 60 books
npm start           # server on http://localhost:3000
```

## API

- `GET /health` — health check
- `POST /reports` — generates a report, returns `201 { id, file }` after a few seconds
- `GET /reports/:id` — report record with its file link; unknown id → `404`
- `GET /reports/:id/file` — downloads the PDF from disk

## Stage 4 note

I would move report generation out of the request the moment multiple users generate reports in parallel or reports grow large, because a request that blocks for seconds keeps the user hostage and makes the API fragile at scale.

## Stage 5 note

`POST /reports` only generates once per day: the check protects against the double-click — the same button, pressed twice, must not create two reports or charge twice. Without it, a user who double-orders an email or a payment gets charged twice, like the workshop's "never email a customer twice" rule — and the refunds and support tickets it provokes cost real money.
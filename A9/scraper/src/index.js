import { crawlCatalogue } from "./crawlCatalogue.js";
import { parseBooks } from "./parseBooks.js";
import { storeRecords, writeRunReport } from "./persist.js";
import { getHtmlStats, resetHtmlStats } from "./getHtml.js";

const CATALOGUE_URL = 'https://books.toscrape.com/';

const startedAt = Date.now();
resetHtmlStats();

const booksUrls = await crawlCatalogue(CATALOGUE_URL, 3);
const { records, failures } = await parseBooks(booksUrls);
const { validCount, errorCount } = await storeRecords(records);

const { pagesFetched, cacheHits } = getHtmlStats();

await writeRunReport({
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    pages_fetched: pagesFetched,
    cache_hits: cacheHits,
    valid_records: validCount,
    invalid_records: errorCount,
    failed_pages: failures.length
});

console.log(`valid=${validCount} errors=${errorCount} skipped=${failures.length} fetched=${pagesFetched} cache=${cacheHits}`);
for (const failure of failures) {
    console.error(`SKIP ${failure.product_url} — ${failure.reason}`);
}

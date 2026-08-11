import { crawlCatalogue } from "./crawlCatalogue.js";
import { parseBooks } from "./parseBooks.js";
import { storeRecords, writeRunReport } from "./persist.js";
import { getHtmlStats, resetHtmlStats } from "./getHtml.js";

const CATALOGUE_URL = 'https://books.toscrape.com/';

const realFetch = globalThis.fetch;
let realNetworkCalls = 0;
globalThis.fetch = async (url, opts) => {
    if (new URL(url).host === 'broken.test') {
        const err = new Error('simulated timeout');
        err.name = 'AbortError';
        throw err;
    }
    realNetworkCalls++;
    return realFetch(url, opts);
};

const startedAt = Date.now();
resetHtmlStats();

const booksUrls = await crawlCatalogue(CATALOGUE_URL, 3);

const madeUp = {
    product_url: 'https://broken.test/catalogue/fake_1/index.html',
    source_page: 'made-up-on-purpose'
};
const poisoned = [...booksUrls, madeUp];

const { records, failures } = await parseBooks(poisoned);
const { validCount, errorCount } = await storeRecords(records, 'output-test');

const { pagesFetched, cacheHits } = getHtmlStats();
await writeRunReport({
    started_at: new Date(startedAt).toISOString(),
    duration_ms: Date.now() - startedAt,
    pages_fetched: pagesFetched,
    cache_hits: cacheHits,
    valid_records: validCount,
    invalid_records: errorCount,
    failed_pages: failures.length
}, 'output-test');

console.log(`real_network_calls=${realNetworkCalls} (must be 0)`);
console.log(`valid=${validCount} errors=${errorCount} skipped=${failures.length} fetched=${pagesFetched} cache=${cacheHits}`);
for (const f of failures) console.error(`SKIP ${f.product_url} — ${f.reason}`);
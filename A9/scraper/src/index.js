import { crawlCatalogue } from "./crawlCatalogue.js";
import { parseBooks } from "./parseBooks.js";
import { storeRecords } from "./persist.js";

const CATALOGUE_URL = 'https://books.toscrape.com/';

const booksUrls = await crawlCatalogue(CATALOGUE_URL, 3);
const records = await parseBooks(booksUrls);
const { validCount, errorCount } = await storeRecords(records);

console.log(`valid=${validCount} errors=${errorCount}`);

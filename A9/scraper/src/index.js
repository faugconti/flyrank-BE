import { crawlCatalogue } from "./crawlCatalogue.js";
import { parseBooks } from "./parseBooks.js";

const CATALOGUE_URL = 'https://books.toscrape.com/';

const booksUrls = await crawlCatalogue(CATALOGUE_URL, 3);
const records = await parseBooks(booksUrls);

console.log(JSON.stringify(records[0], null, 2));
console.log(`detail_pages=${records.length}`);
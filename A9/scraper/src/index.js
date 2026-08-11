import { crawlCatalogue } from "./crawlCatalogue.js";


const CATALOGUE_URL = 'https://books.toscrape.com/';



const booksUurls = await crawlCatalogue(CATALOGUE_URL,3);
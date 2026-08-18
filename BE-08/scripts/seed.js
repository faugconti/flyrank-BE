import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { deleteAll, insertMany, count } from "../src/repository/books.repository.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKS_PATH = path.join(__dirname, "..", "data", "books.json");

const RATING_TO_NUMBER = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
};

function loadBooks() {
  const raw = JSON.parse(readFileSync(BOOKS_PATH, "utf8"));
  return raw.map((book) => ({
    title: book.title,
    price: book.price_gbp,
    rating: RATING_TO_NUMBER[book.rating_text],
    url: book.product_url,
  }));
}

deleteAll();
insertMany(loadBooks());
console.log(`Seeded ${count()} books into report.db`);
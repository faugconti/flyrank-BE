import db from "../db.js";

export function deleteAll() {
  db.prepare("DELETE FROM books").run();
}

export function insertMany(books) {
  const insert = db.prepare(
    "INSERT INTO books (title, price, rating, url) VALUES (?, ?, ?, ?)"
  );
  db.exec("BEGIN");
  try {
    for (const book of books) {
      insert.run(book.title, book.price, book.rating, book.url);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function count() {
  return db.prepare("SELECT COUNT(*) AS n FROM books").get().n;
}

export function avgPrice() {
  return db.prepare("SELECT AVG(price) AS avg FROM books").get().avg;
}

export function mostExpensive(limit = 5) {
  return db
    .prepare("SELECT title, price FROM books ORDER BY price DESC LIMIT ?")
    .all(limit);
}

export function perRating() {
  return db
    .prepare("SELECT rating, COUNT(*) AS n FROM books GROUP BY rating ORDER BY rating")
    .all();
}
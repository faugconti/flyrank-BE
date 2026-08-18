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
import db from "../db.js";

export function insert() {
  return db
    .prepare("INSERT INTO reports (path, created_at) VALUES (?, ?)")
    .run("", new Date().toISOString()).lastInsertRowid;
}

export function updatePath(id, path) {
  db.prepare("UPDATE reports SET path = ? WHERE id = ?").run(path, id);
}

export function findById(id) {
  return db.prepare("SELECT id, path, created_at FROM reports WHERE id = ?").get(id);
}

export function findToday() {
  return db
    .prepare("SELECT id, path, created_at FROM reports WHERE date(created_at) = date('now') LIMIT 1")
    .get();
}
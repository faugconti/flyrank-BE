const db = require('../db');

function findAll() {
  return db.prepare('SELECT * FROM tasks').all().map(t => ({ ...t, done: !!t.done }));
}

function findById(id) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return task ? { ...task, done: !!task.done } : null;
}

const SEED_TASKS = [
  { id: 1, title: 'Buy groceries', done: false },
  { id: 2, title: 'Walk the dog', done: true },
  { id: 3, title: 'Read a book', done: false },
];

let tasks = SEED_TASKS.map((task) => ({ ...task }));

function create({ title, done }) {
  const query = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, done ? 1 : 0);
  return { id: Number(query.lastInsertRowid), title, done: !!done };
}

function update(id, changes) {
  const fields = [];
  const values = [];

  if ('title' in changes) {
    fields.push('title = ?');
    values.push(changes.title);
  }
  if ('done' in changes) {
    fields.push('done = ?');
    values.push(changes.done ? 1 : 0);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  if (query.changes === 0) return null;
  return findById(id);
}

function remove(id) {
  const query = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return query.changes > 0;
}

function reset() {
  tasks = SEED_TASKS.map((task) => ({ ...task }));
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };

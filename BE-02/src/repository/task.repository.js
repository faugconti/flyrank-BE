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
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, changes);
  return { ...task };
}

function remove(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

function reset() {
  tasks = SEED_TASKS.map((task) => ({ ...task }));
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };

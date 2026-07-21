const db = require('../db');

function findAll({ search, done } = {}) {
  let sql = 'SELECT * FROM tasks';
  const conditions = [];
  const values = [];

  if (search !== undefined) {
    conditions.push('title LIKE ?');
    values.push(`%${search}%`);
  }

  if (done !== undefined) {
    conditions.push('done = ?');
    values.push(done ? 1 : 0);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY title COLLATE NOCASE';

  return db.prepare(sql).all(...values).map(t => ({ ...t, done: !!t.done }));
}

function findById(id) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return task ? { ...task, done: !!task.done } : null;
}

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

function getStats() {
  const row = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) as done
    FROM tasks
  `).get();
  return { total: row.total, done: row.done };
}

function reset() {
  const seed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const clear = db.prepare('DELETE FROM tasks');

  const resetTransaction = db.transaction(() => {
    clear.run();
    seed.run('Buy groceries', 0);
    seed.run('Walk the dog', 1);
    seed.run('Read a book', 0);
  });

  resetTransaction();
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, getStats, reset };

const { db } = require('../../db');

async function findAll({ search, done } = {}) {
  let sql = 'SELECT * FROM tasks';
  const conditions = [];
  const values = [];

  if (search !== undefined) {
    conditions.push('title ILIKE $' + (values.length + 1));
    values.push(`%${search}%`);
  }

  if (done !== undefined) {
    conditions.push('done = $' + (values.length + 1));
    values.push(done);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY title COLLATE "C"';

  const { rows } = await db.query(sql, values);
  return rows;
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ title, done }) {
  const { rows } = await db.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING id',
    [title, done]
  );
  return { id: rows[0].id, title, done };
}

async function update(id, changes) {
  const fields = [];
  const values = [];

  if ('title' in changes) {
    fields.push(`title = $${values.length + 1}`);
    values.push(changes.title);
  }
  if ('done' in changes) {
    fields.push(`done = $${values.length + 1}`);
    values.push(changes.done);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const { rowCount } = await db.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${values.length}`,
    values
  );

  if (rowCount === 0) return null;
  return findById(id);
}

async function remove(id) {
  const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  return rowCount > 0;
}

async function getStats() {
  const { rows } = await db.query(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN done = TRUE THEN 1 ELSE 0 END) as done
    FROM tasks
  `);
  return { total: Number(rows[0].total), done: Number(rows[0].done) };
}

async function reset() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM tasks');
    await client.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Buy groceries', false]);
    await client.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Walk the dog', true]);
    await client.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Read a book', false]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, getStats, reset };

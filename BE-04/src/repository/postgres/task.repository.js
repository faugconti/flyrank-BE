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


module.exports = { findAll, findById};

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'tasks.db');
const db = new Database(dbPath);

const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
db.exec(schema);

const { count } = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (count === 0) {
    const seed = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed.sql'), 'utf8');
    db.exec(seed);
}

module.exports = db;

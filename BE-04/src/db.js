const fs = require('fs');
const path = require('path');

const driver = process.env.DB_DRIVER || 'sqlite';
const sqlDir = path.join(__dirname, '..', 'sql');

let db;

if (driver === 'postgres') {
    const { Pool } = require('pg');
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
} else {
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, '..', 'tasks.db');
    db = new Database(dbPath);

    const schemaFile = fs.readFileSync(path.join(sqlDir, 'schema.sqlite.sql'), 'utf8');
    db.exec(schemaFile);

    const { count } = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
    if (count === 0) {
        const seed = fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8');
        db.exec(seed);
    }
}

module.exports = db;

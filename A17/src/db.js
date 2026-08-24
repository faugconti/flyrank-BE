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
}

async function initDb() {
    if (driver === 'postgres') {
        const schema = fs.readFileSync(path.join(sqlDir, 'schema.postgres.sql'), 'utf8');
        await db.query(schema);

        const { rows } = await db.query('SELECT COUNT(*) as count FROM tasks');
        if (Number(rows[0].count) === 0) {
            const seed = fs.readFileSync(path.join(sqlDir, 'seed.postgres.sql'), 'utf8');
            await db.query(seed);
        }
    } else {
        const schema = fs.readFileSync(path.join(sqlDir, 'schema.sqlite.sql'), 'utf8');
        db.exec(schema);

        const { count } = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
        if (count === 0) {
            const seed = fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8');
            db.exec(seed);
        }
    }
}

module.exports = { db, initDb };

const driver = process.env.DB_DRIVER || 'sqlite';

if (driver === 'postgres') {
    module.exports = require('./postgres/task.repository');
} else {
    module.exports = require('./sqlite/task.repository');
}

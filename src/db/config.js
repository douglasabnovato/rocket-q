/*
 * config.js (db) · abre uma única conexão SQLite por processo,
 * liga as chaves estrangeiras e aplica as migrações.
 */
const Database = require('better-sqlite3')
const { migrate } = require('./migrations')
const config = require('../config')

/* Cria a conexão; use ':memory:' nos testes. */
function openDatabase(file = config.databaseFile) {
    const db = new Database(file)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    migrate(db, { bcryptCost: config.bcryptCost })
    return db
}

module.exports = { openDatabase }
/* fim de db/config.js */

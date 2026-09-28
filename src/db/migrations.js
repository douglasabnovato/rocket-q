/*
 * migrations.js · versiona o schema com PRAGMA user_version.
 * Versão 1: rooms(pass_hash) e questions(room_id, is_read) com chaves e restrições.
 * Converte o schema legado (rooms.pass em texto puro) dentro de uma transação.
 */
const bcrypt = require('bcryptjs')

const SCHEMA_V1 = `
    CREATE TABLE rooms (
        id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 999999),
        pass_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 500),
        is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_questions_room_read ON questions (room_id, is_read, id);
`

/* Indica se a tabela existe no banco. */
function tableExists(db, name) {
    return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name))
}

/* Migra o schema legado: renomeia, cria o novo, copia com hash e remove o antigo. */
function migrateLegacy(db, bcryptCost) {
    db.exec('ALTER TABLE rooms RENAME TO legacy_rooms; ALTER TABLE questions RENAME TO legacy_questions;')
    db.exec(SCHEMA_V1)
    const insertRoom = db.prepare('INSERT INTO rooms (id, pass_hash) VALUES (?, ?)')
    for (const room of db.prepare('SELECT id, pass FROM legacy_rooms WHERE id IS NOT NULL').all()) {
        insertRoom.run(room.id, bcrypt.hashSync(String(room.pass ?? ''), bcryptCost))
    }
    db.exec(`
        INSERT INTO questions (id, room_id, title, is_read)
        SELECT q.id, q.room, substr(trim(q.title), 1, 500), CASE WHEN q.read = 1 THEN 1 ELSE 0 END
        FROM legacy_questions q
        JOIN rooms r ON r.id = q.room
        WHERE length(trim(coalesce(q.title, ''))) > 0;
        DROP TABLE legacy_questions;
        DROP TABLE legacy_rooms;
    `)
}

/* Leva o banco até a versão mais recente; é idempotente. */
function migrate(db, { bcryptCost = 10 } = {}) {
    const version = db.pragma('user_version', { simple: true })
    if (version >= 1) return
    db.transaction(() => {
        const legacy = tableExists(db, 'rooms') &&
            db.prepare('PRAGMA table_info(rooms)').all().some((column) => column.name === 'pass')
        if (legacy) migrateLegacy(db, bcryptCost)
        else db.exec(SCHEMA_V1)
        db.pragma('user_version = 1')
    })()
}

module.exports = { migrate }
/* fim de migrations.js */

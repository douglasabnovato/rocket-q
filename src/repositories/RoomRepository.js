/*
 * RoomRepository · acesso à tabela rooms com consultas parametrizadas.
 */
class RoomRepository {
    /* Prepara as consultas uma vez (reuso do plano de execução). */
    constructor(db) {
        this.insertStatement = db.prepare('INSERT INTO rooms (id, pass_hash) VALUES (?, ?)')
        this.findStatement = db.prepare('SELECT id, pass_hash AS passHash FROM rooms WHERE id = ?')
    }

    /* Insere a sala; lança SQLITE_CONSTRAINT_PRIMARYKEY se o código já existir. */
    insert(id, passHash) {
        this.insertStatement.run(id, passHash)
    }

    /* Busca a sala pelo código ou devolve undefined. */
    findById(id) {
        return this.findStatement.get(id)
    }
}

module.exports = RoomRepository
/* fim de RoomRepository */

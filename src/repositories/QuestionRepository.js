/*
 * QuestionRepository · acesso à tabela questions; toda operação é limitada à sala (RN04).
 */
class QuestionRepository {
    /* Prepara as consultas uma vez. */
    constructor(db) {
        this.insertStatement = db.prepare('INSERT INTO questions (room_id, title) VALUES (?, ?)')
        this.listStatement = db.prepare(
            'SELECT id, title, is_read AS isRead FROM questions WHERE room_id = ? ORDER BY is_read ASC, id DESC'
        )
        this.markReadStatement = db.prepare('UPDATE questions SET is_read = 1 WHERE id = ? AND room_id = ?')
        this.deleteStatement = db.prepare('DELETE FROM questions WHERE id = ? AND room_id = ?')
        this.existsStatement = db.prepare('SELECT 1 FROM questions WHERE id = ? AND room_id = ?')
    }

    /* Grava uma pergunta nova como não lida. */
    insert(roomId, title) {
        this.insertStatement.run(roomId, title)
    }

    /* Lista as perguntas da sala: não lidas primeiro, mais recentes no topo. */
    listByRoom(roomId) {
        return this.listStatement.all(roomId)
    }

    /* Indica se a pergunta pertence à sala. */
    existsInRoom(id, roomId) {
        return Boolean(this.existsStatement.get(id, roomId))
    }

    /* Marca como lida somente se a pergunta for da sala. */
    markRead(id, roomId) {
        return this.markReadStatement.run(id, roomId).changes
    }

    /* Exclui somente se a pergunta for da sala. */
    delete(id, roomId) {
        return this.deleteStatement.run(id, roomId).changes
    }
}

module.exports = QuestionRepository
/* fim de QuestionRepository */

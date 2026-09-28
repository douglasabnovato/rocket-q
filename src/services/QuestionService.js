/*
 * QuestionService · regras das perguntas: texto válido (RN03) e moderação só com a senha da sala (RN04).
 */
const { AppError } = require('../lib/errors')
const { validateQuestion } = require('../lib/validation')

const ACTIONS = ['check', 'delete']

class QuestionService {
    /* Recebe os repositórios/serviços por injeção de dependência. */
    constructor(questionRepository, roomService) {
        this.questions = questionRepository
        this.roomService = roomService
    }

    /* Grava a pergunta anônima numa sala existente. */
    ask(roomId, rawTitle) {
        this.roomService.get(roomId)
        this.questions.insert(roomId, validateQuestion(rawTitle))
    }

    /* Devolve as perguntas separadas em não lidas e lidas. */
    listForRoom(roomId) {
        this.roomService.get(roomId)
        const all = this.questions.listByRoom(roomId)
        return {
            unread: all.filter((question) => !question.isRead),
            read: all.filter((question) => question.isRead)
        }
    }

    /* Marca como lida ou exclui, após validar ação, pertença à sala e senha. */
    async moderate(roomId, questionId, action, password) {
        if (!ACTIONS.includes(action)) throw new AppError('invalid_action', 'Ação inválida.', 404)
        await this.roomService.checkPassword(roomId, password)
        if (!this.questions.existsInRoom(questionId, roomId)) {
            throw new AppError('question_not_found', 'Pergunta não encontrada nesta sala.', 404)
        }
        if (action === 'check') this.questions.markRead(questionId, roomId)
        else this.questions.delete(questionId, roomId)
    }
}

module.exports = QuestionService
/* fim de QuestionService */

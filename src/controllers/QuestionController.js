/*
 * QuestionController · traduz HTTP para o QuestionService (Post/Redirect/Get).
 */
const { parseRoomId, parseQuestionId } = require('../lib/validation')

const RESULT = { check: 'marcada', delete: 'excluida' }

/* Cria o controller com o serviço injetado. */
function createQuestionController({ questionService }) {
    return {
        /* POST /question/create/:room */
        create(req, res) {
            const roomId = parseRoomId(req.params.room)
            try {
                questionService.ask(roomId, req.body.question)
                res.redirect(303, `/room/${roomId}?ok=pergunta-enviada`)
            } catch (error) {
                if (error.code !== 'invalid_question') throw error
                res.redirect(303, `/room/${roomId}?erro=pergunta`)
            }
        },

        /* POST /question/:room/:question/:action */
        async index(req, res, next) {
            try {
                const roomId = parseRoomId(req.params.room)
                const questionId = parseQuestionId(req.params.question)
                const { action } = req.params
                try {
                    await questionService.moderate(roomId, questionId, action, req.body.password)
                    res.redirect(303, `/room/${roomId}?ok=${RESULT[action]}`)
                } catch (error) {
                    if (error.code !== 'wrong_password') throw error
                    res.redirect(303, `/room/${roomId}?erro=senha`)
                }
            } catch (error) {
                next(error)
            }
        }
    }
}

module.exports = createQuestionController
/* fim de QuestionController */

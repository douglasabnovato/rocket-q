/*
 * RoomController · traduz HTTP para o RoomService e renderiza as views da sala.
 */
const { parseRoomId } = require('../lib/validation')

const MESSAGES = {
    ok: {
        'sala-criada': 'Sala criada! Compartilhe o código com o público.',
        'pergunta-enviada': 'Pergunta enviada.',
        'marcada': 'Pergunta marcada como lida.',
        'excluida': 'Pergunta excluída.'
    },
    erro: {
        'senha': 'Senha incorreta. Nenhuma alteração foi feita.',
        'pergunta': 'Escreva uma pergunta de 1 a 500 caracteres.'
    }
}

/* Cria o controller com os serviços injetados. */
function createRoomController({ roomService, questionService }) {
    return {
        /* POST /create-room */
        async create(req, res, next) {
            try {
                const roomId = await roomService.create(req.body.password)
                res.redirect(303, `/room/${roomId}?ok=sala-criada`)
            } catch (error) {
                if (error.code !== 'invalid_password') return next(error)
                res.status(400).render('index', { page: 'create-pass', error: error.message })
            }
        },

        /* GET /room/:room */
        open(req, res) {
            const roomId = parseRoomId(req.params.room)
            const { unread, read } = questionService.listForRoom(roomId)
            res.render('room', {
                roomId,
                questions: unread,
                questionsRead: read,
                isNoQuestions: unread.length === 0 && read.length === 0,
                success: MESSAGES.ok[req.query.ok] || null,
                error: MESSAGES.erro[req.query.erro] || null
            })
        },

        /* POST /enterroom */
        enter(req, res) {
            try {
                const roomId = parseRoomId(req.body.roomId)
                roomService.get(roomId)
                res.redirect(303, `/room/${roomId}`)
            } catch (error) {
                res.status(404).render('index', { page: 'enter-room', error: 'Sala não encontrada. Confira o código.' })
            }
        }
    }
}

module.exports = createRoomController
/* fim de RoomController */

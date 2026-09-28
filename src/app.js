/*
 * app.js · monta o Express com segurança (helmet), views, rotas e tratamento de erros.
 * Recebe o banco por parâmetro para permitir testes com SQLite em memória.
 */
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const config = require('./config')
const RoomRepository = require('./repositories/RoomRepository')
const QuestionRepository = require('./repositories/QuestionRepository')
const RoomService = require('./services/RoomService')
const QuestionService = require('./services/QuestionService')
const createRoomController = require('./controllers/RoomController')
const createQuestionController = require('./controllers/QuestionController')
const createRouter = require('./route')
const { notFound, errorHandler } = require('./middleware/errors')

/* Cria a aplicação com as dependências conectadas (composition root). */
function createApp(db, { bcryptCost = config.bcryptCost } = {}) {
    const roomService = new RoomService(new RoomRepository(db), { bcryptCost })
    const questionService = new QuestionService(new QuestionRepository(db), roomService)

    const app = express()
    if (config.trustProxy) app.set('trust proxy', 1)
    app.disable('x-powered-by')
    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, 'views'))

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                'default-src': ["'self'"],
                'style-src': ["'self'", 'https://fonts.googleapis.com'],
                'font-src': ["'self'", 'https://fonts.gstatic.com'],
                'img-src': ["'self'", 'data:'],
                'script-src': ["'self'"]
            }
        }
    }))
    app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d' }))
    app.use(express.urlencoded({ extended: false, limit: '10kb' }))

    app.use(createRouter({
        roomController: createRoomController({ roomService, questionService }),
        questionController: createQuestionController({ questionService })
    }))
    app.use(notFound)
    app.use(errorHandler)
    return app
}

module.exports = { createApp }
/* fim de app.js */

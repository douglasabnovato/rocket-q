/*
 * route.js · rotas da aplicação (URLs originais mantidas).
 */
const express = require('express')
const rateLimit = require('express-rate-limit')

/* Monta o roteador com os controllers injetados. */
function createRouter({ roomController, questionController }) {
    const route = express.Router()
    const sensitiveLimit = rateLimit({
        windowMs: 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (req, res) => res.status(429).render('error', {
            title: 'Muitas tentativas',
            message: 'Aguarde um minuto e tente novamente.'
        })
    })

    route.get('/', (req, res) => res.render('index', { page: 'enter-room', error: null }))
    route.get('/create-pass', (req, res) => res.render('index', { page: 'create-pass', error: null }))

    route.post('/create-room', sensitiveLimit, roomController.create)
    route.get('/room/:room', roomController.open)
    route.post('/enterroom', roomController.enter)

    route.post('/question/create/:room', questionController.create)
    route.post('/question/:room/:question/:action', sensitiveLimit, questionController.index)

    return route
}

module.exports = createRouter
/* fim de route.js */

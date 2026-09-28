/*
 * server.js · ponto de entrada: abre o banco e sobe o servidor na porta do ambiente.
 */
const config = require('./config')
const { openDatabase } = require('./db/config')
const { createApp } = require('./app')

const db = openDatabase()
const server = createApp(db).listen(config.port, () => {
    console.log(`Rocket.Q rodando em http://localhost:${config.port}`)
})

/* Encerra com elegância: para de aceitar conexões e fecha o banco. */
function shutdown() {
    server.close(() => {
        db.close()
        process.exit(0)
    })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
/* fim de server.js */

/*
 * init.js · cria ou atualiza o banco (npm run init-db). Pode rodar várias vezes.
 */
const { openDatabase } = require('./config')
const config = require('../config')

const db = openDatabase()
console.log(`Banco pronto em ${config.databaseFile} (schema v${db.pragma('user_version', { simple: true })})`)
db.close()
/* fim de init.js */

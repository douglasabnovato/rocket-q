/*
 * config.js · configuração lida do ambiente (12-Factor, fator III).
 */
const path = require('path')

module.exports = {
    port: Number(process.env.PORT) || 3000,
    databaseFile: process.env.DATABASE_FILE || path.join(__dirname, 'db', 'rocketq.sqlite'),
    bcryptCost: Number(process.env.BCRYPT_COST) || 10,
    trustProxy: process.env.TRUST_PROXY === '1'
}
/* fim de config.js */

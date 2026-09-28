/*
 * errors.js · erros de domínio com status HTTP.
 */
class AppError extends Error {
    /* Cria o erro com código estável e status HTTP. */
    constructor(code, message, status) {
        super(message)
        this.code = code
        this.status = status
    }
}

module.exports = { AppError }
/* fim de errors.js */

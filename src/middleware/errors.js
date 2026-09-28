/*
 * errors.js (middleware) · páginas 404 e 500; nunca expõe detalhes internos.
 */

/* Rota não encontrada. */
function notFound(req, res) {
    res.status(404).render('error', { title: 'Página não encontrada', message: 'Confira o endereço digitado.' })
}

/* Erros de domínio viram a página com a mensagem; os demais viram 500 genérico. */
function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error)
    if (error.status && error.status < 500) {
        return res.status(error.status).render('error', { title: error.message, message: 'Volte para o início e tente de novo.' })
    }
    console.error(error)
    res.status(500).render('error', { title: 'Algo deu errado', message: 'Tente novamente em instantes.' })
}

module.exports = { notFound, errorHandler }
/* fim de middleware/errors.js */

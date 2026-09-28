/*
 * validation.js · regras de entrada (RN01 a RN03).
 */
const { AppError } = require('./errors')

const ROOM_ID = /^\d{1,6}$/

/* Converte o código da sala em número ou lança 404. */
function parseRoomId(value) {
    const text = String(value ?? '').trim()
    if (!ROOM_ID.test(text)) throw new AppError('room_not_found', 'Sala não encontrada.', 404)
    return Number(text)
}

/* Converte o id da pergunta em número ou lança 404. */
function parseQuestionId(value) {
    const text = String(value ?? '')
    if (!/^\d{1,12}$/.test(text)) throw new AppError('question_not_found', 'Pergunta não encontrada.', 404)
    return Number(text)
}

/* Valida a senha da sala: 6 a 72 caracteres (limite do bcrypt). */
function validatePassword(value) {
    const password = String(value ?? '')
    if (password.length < 6 || Buffer.byteLength(password) > 72) {
        throw new AppError('invalid_password', 'A senha precisa ter de 6 a 72 caracteres.', 400)
    }
    return password
}

/* Valida o texto da pergunta: 1 a 500 caracteres após remover espaços das pontas. */
function validateQuestion(value) {
    const title = String(value ?? '').trim()
    if (title.length < 1 || title.length > 500) {
        throw new AppError('invalid_question', 'Escreva uma pergunta de 1 a 500 caracteres.', 400)
    }
    return title
}

module.exports = { parseRoomId, parseQuestionId, validatePassword, validateQuestion }
/* fim de validation.js */

/*
 * RoomService · regras da sala: código único de 6 dígitos (RN01) e senha com bcrypt (RN02).
 */
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { AppError } = require('../lib/errors')
const { validatePassword } = require('../lib/validation')

const MAX_ATTEMPTS = 5

class RoomService {
    /* Recebe o repositório e o custo do bcrypt por injeção de dependência. */
    constructor(roomRepository, { bcryptCost = 10, randomInt = crypto.randomInt } = {}) {
        this.rooms = roomRepository
        this.bcryptCost = bcryptCost
        this.randomInt = randomInt
    }

    /* Cria a sala e devolve o código; a chave primária garante a unicidade. */
    async create(rawPassword) {
        const password = validatePassword(rawPassword)
        const passHash = await bcrypt.hash(password, this.bcryptCost)
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const id = this.randomInt(100000, 1000000)
            try {
                this.rooms.insert(id, passHash)
                return id
            } catch (error) {
                if (error.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw error
            }
        }
        throw new AppError('room_code_exhausted', 'Não foi possível gerar o código da sala. Tente de novo.', 503)
    }

    /* Devolve a sala ou lança 404. */
    get(id) {
        const room = this.rooms.findById(id)
        if (!room) throw new AppError('room_not_found', 'Sala não encontrada.', 404)
        return room
    }

    /* Confere a senha da sala em tempo constante (bcrypt.compare). */
    async checkPassword(id, password) {
        const room = this.get(id)
        const ok = await bcrypt.compare(String(password ?? ''), room.passHash)
        if (!ok) throw new AppError('wrong_password', 'Senha incorreta. Nenhuma alteração foi feita.', 401)
    }
}

module.exports = RoomService
/* fim de RoomService */

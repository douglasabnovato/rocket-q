/*
 * app.test.js · testes de integração (node:test + supertest) com SQLite em memória.
 * Cobrem os critérios de aceite do MVP: segurança, regras de negócio e estados.
 */
const { test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const Database = require('better-sqlite3')
const { migrate } = require('../src/db/migrations')
const { createApp } = require('../src/app')

let db
let app

/* Cria uma sala e devolve o código extraído do redirecionamento. */
async function createRoom(password = 'segredo1') {
    const response = await request(app).post('/create-room').type('form').send({ password })
    assert.equal(response.status, 303)
    return Number(response.headers.location.match(/\/room\/(\d+)/)[1])
}

/* Envia uma pergunta para a sala. */
function ask(roomId, question) {
    return request(app).post(`/question/create/${roomId}`).type('form').send({ question })
}

beforeEach(() => {
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    migrate(db, { bcryptCost: 4 })
    app = createApp(db, { bcryptCost: 4 })
})

test('cria sala com código de 6 dígitos e guarda só o hash bcrypt', async () => {
    const roomId = await createRoom('segredo1')
    assert.match(String(roomId), /^\d{6}$/)
    const row = db.prepare('SELECT pass_hash FROM rooms WHERE id = ?').get(roomId)
    assert.match(row.pass_hash, /^\$2[aby]\$/)
    assert.notEqual(row.pass_hash, 'segredo1')
})

test('rejeita senha curta com 400 e mensagem', async () => {
    const response = await request(app).post('/create-room').type('form').send({ password: '123' })
    assert.equal(response.status, 400)
    assert.match(response.text, /de 6 a 72 caracteres/)
})

test('pergunta com tentativa de injeção de SQL é gravada como texto', async () => {
    const roomId = await createRoom()
    const payload = 'x"); DROP TABLE rooms; --'
    const response = await ask(roomId, payload)
    assert.equal(response.status, 303)
    const page = await request(app).get(`/room/${roomId}`)
    assert.match(page.text, /x&#34;\); DROP TABLE rooms; --/)
    assert.equal(db.prepare('SELECT count(*) AS total FROM rooms').get().total, 1)
})

test('escapa HTML da pergunta (XSS armazenado)', async () => {
    const roomId = await createRoom()
    await ask(roomId, '<script>alert(1)</script>')
    const page = await request(app).get(`/room/${roomId}`)
    assert.ok(!page.text.includes('<script>alert(1)</script>'))
})

test('pergunta vazia volta com erro e não é gravada', async () => {
    const roomId = await createRoom()
    const response = await ask(roomId, '   ')
    assert.equal(response.headers.location, `/room/${roomId}?erro=pergunta`)
    assert.equal(db.prepare('SELECT count(*) AS total FROM questions').get().total, 0)
})

test('sala inexistente: entrar mostra aviso; abrir e perguntar dão 404', async () => {
    const enter = await request(app).post('/enterroom').type('form').send({ roomId: '999999' })
    assert.equal(enter.status, 404)
    assert.match(enter.text, /Sala não encontrada/)
    assert.equal((await request(app).get('/room/999999')).status, 404)
    assert.equal((await ask(999999, 'oi')).status, 404)
})

test('senha correta marca como lida e depois exclui', async () => {
    const roomId = await createRoom('segredo1')
    await ask(roomId, 'Primeira?')
    const questionId = db.prepare('SELECT id FROM questions').get().id

    const check = await request(app).post(`/question/${roomId}/${questionId}/check`).type('form').send({ password: 'segredo1' })
    assert.equal(check.headers.location, `/room/${roomId}?ok=marcada`)
    assert.equal(db.prepare('SELECT is_read FROM questions WHERE id = ?').get(questionId).is_read, 1)

    const remove = await request(app).post(`/question/${roomId}/${questionId}/delete`).type('form').send({ password: 'segredo1' })
    assert.equal(remove.headers.location, `/room/${roomId}?ok=excluida`)
    assert.equal(db.prepare('SELECT count(*) AS total FROM questions').get().total, 0)
})

test('senha errada não altera nada e mostra mensagem na sala', async () => {
    const roomId = await createRoom('segredo1')
    await ask(roomId, 'Fica?')
    const questionId = db.prepare('SELECT id FROM questions').get().id
    const response = await request(app).post(`/question/${roomId}/${questionId}/delete`).type('form').send({ password: 'errada00' })
    assert.equal(response.headers.location, `/room/${roomId}?erro=senha`)
    assert.equal(db.prepare('SELECT count(*) AS total FROM questions').get().total, 1)
    const page = await request(app).get(response.headers.location)
    assert.match(page.text, /Senha incorreta/)
})

test('senha da sala A não exclui pergunta da sala B (IDOR)', async () => {
    const roomA = await createRoom('senhaDaA')
    const roomB = await createRoom('senhaDaB')
    await ask(roomB, 'Pergunta da B')
    const questionB = db.prepare('SELECT id FROM questions WHERE room_id = ?').get(roomB).id
    const response = await request(app).post(`/question/${roomA}/${questionB}/delete`).type('form').send({ password: 'senhaDaA' })
    assert.equal(response.status, 404)
    assert.equal(db.prepare('SELECT count(*) AS total FROM questions').get().total, 1)
})

test('ação desconhecida responde 404 sem derrubar o servidor', async () => {
    const roomId = await createRoom()
    const response = await request(app).post(`/question/${roomId}/1/drop`).type('form').send({ password: 'segredo1' })
    assert.equal(response.status, 404)
    assert.equal((await request(app).get('/')).status, 200)
})

test('lista não lidas antes das lidas e mostra estado vazio', async () => {
    const roomId = await createRoom('segredo1')
    let page = await request(app).get(`/room/${roomId}`)
    assert.match(page.text, /Nenhuma pergunta por aqui/)
    await ask(roomId, 'Lida depois')
    await ask(roomId, 'Continua aberta')
    const first = db.prepare("SELECT id FROM questions WHERE title = 'Lida depois'").get().id
    await request(app).post(`/question/${roomId}/${first}/check`).type('form').send({ password: 'segredo1' })
    page = await request(app).get(`/room/${roomId}`)
    assert.ok(page.text.indexOf('Continua aberta') < page.text.indexOf('Lida depois'))
})

test('limita tentativas de senha a 10 por minuto (429)', async () => {
    const roomId = await createRoom('segredo1')
    let last
    for (let attempt = 0; attempt < 11; attempt++) {
        last = await request(app).post(`/question/${roomId}/1/check`).type('form').send({ password: 'x' })
    }
    assert.equal(last.status, 429)
})

test('envia cabeçalhos de segurança e esconde x-powered-by', async () => {
    const response = await request(app).get('/')
    assert.ok(response.headers['content-security-policy'])
    assert.equal(response.headers['x-powered-by'], undefined)
    assert.match(response.text, /<html lang="pt-BR">/)
})

test('migra o schema legado com senha em texto puro para hash', () => {
    const legacy = new Database(':memory:')
    legacy.exec(`
        CREATE TABLE rooms (id INTEGER PRIMARY KEY, pass TEXT);
        CREATE TABLE questions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, read INT, room INT);
        INSERT INTO rooms VALUES (123456, 'antiga');
        INSERT INTO questions (title, read, room) VALUES ('ok', 1, 123456), ('orfã', 0, 777777), ('', 0, 123456);
    `)
    migrate(legacy, { bcryptCost: 4 })
    const room = legacy.prepare('SELECT pass_hash FROM rooms WHERE id = 123456').get()
    assert.ok(require('bcryptjs').compareSync('antiga', room.pass_hash))
    assert.deepEqual(legacy.prepare('SELECT title, is_read FROM questions').all(), [{ title: 'ok', is_read: 1 }])
    assert.equal(legacy.pragma('user_version', { simple: true }), 1)
    migrate(legacy)
})
/* fim de app.test.js */

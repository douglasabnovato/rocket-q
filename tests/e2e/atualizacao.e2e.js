/*
 * atualizacao.e2e.js · a lista da sala se atualiza a cada 15 s sem recarregar (#10).
 * O relógio do Playwright avança o tempo; a pergunta nova chega por outra "pessoa" (request).
 */
const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

test.beforeEach(async ({ context }) => {
    await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
})

/* Avança 15 s, espera a resposta da consulta e o aviso (gravado 100 ms depois). */
async function umaVolta(page) {
    const resposta = page.waitForResponse('**/questions.json')
    await page.clock.runFor(15_000)
    await resposta
    await page.evaluate(() => Promise.resolve())
    await page.clock.runFor(200)
}

test('pergunta de outra pessoa aparece sem recarregar e é anunciada', async ({ page, request }) => {
    const consultas = []
    page.on('request', (req) => { if (req.url().endsWith('/questions.json')) consultas.push(req.url()) })
    await page.clock.install()
    await page.goto('/create-pass')
    await page.getByLabel('Senha de administração da sala').fill('senha-de-teste-2')
    await page.getByRole('button', { name: 'Criar sala' }).click()
    await expect(page).toHaveURL(/\/room\/\d{6}\?ok=sala-criada$/)
    const codigo = page.url().match(/\/room\/(\d{6})/)[1]
    await expect(page.getByText('Nenhuma pergunta por aqui...')).toBeVisible()

    // Marca a página: se ela recarregar, a marca some.
    await page.evaluate(() => { window.semRecarregar = true })

    // Sem mudança, a volta de 15 s consulta, mas não mexe na lista nem avisa.
    await umaVolta(page)
    expect(consultas).toHaveLength(1)
    await expect(page.locator('#questions-status')).toHaveText('')
    await expect(page.getByText('Nenhuma pergunta por aqui...')).toBeVisible()

    const resposta = await request.post(`/question/create/${codigo}`, {
        form: { question: 'Chegou <b>sem</b> recarregar?' },
        maxRedirects: 0
    })
    expect(resposta.status()).toBe(303)

    await umaVolta(page)
    const nova = page.locator('article.question-wrapper').filter({ hasText: 'Chegou <b>sem</b> recarregar?' })
    await expect(nova).toBeVisible()
    await expect(page.locator('#questions-status')).toHaveText('1 pergunta nova.')
    await expect(page.getByText('Nenhuma pergunta por aqui...')).toHaveCount(0)
    expect(await page.evaluate(() => window.semRecarregar)).toBe(true)
    // O texto entra como texto, nunca como HTML.
    await expect(nova.locator('b')).toHaveCount(0)

    // Os botões da pergunta nova abrem o diálogo (um ouvinte só na lista).
    await nova.getByRole('button', { name: 'Marcar como lida' }).click()
    const dialogo = page.getByRole('dialog')
    await expect(dialogo).toBeVisible()
    await expect(dialogo.getByRole('heading')).toHaveText('Marcar como lida esta pergunta')
    expect(await page.locator('.modal form').getAttribute('action')).toMatch(new RegExp(`^/question/${codigo}/\\d+/check$`))

    // Com o diálogo aberto, a página nem consulta, e a lista não muda.
    await request.post(`/question/create/${codigo}`, { form: { question: 'Segunda pergunta' }, maxRedirects: 0 })
    await request.post(`/question/create/${codigo}`, { form: { question: 'Terceira pergunta' }, maxRedirects: 0 })
    const antes = consultas.length
    await page.clock.runFor(15_000)
    expect(consultas).toHaveLength(antes)
    await expect(page.locator('article.question-wrapper')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(dialogo).toBeHidden()

    // Fechado o diálogo, a próxima volta traz as duas e o aviso muda.
    await umaVolta(page)
    await expect(page.locator('article.question-wrapper')).toHaveCount(3)
    await expect(page.locator('#questions-status')).toHaveText('2 perguntas novas.')

    // Sem rede, a volta falha em silêncio: a lista fica como está e a página não quebra.
    const erros = []
    page.on('pageerror', (erro) => erros.push(erro.message))
    await page.route('**/questions.json', (route) => route.abort('internetdisconnected'))
    await request.post(`/question/create/${codigo}`, { form: { question: 'Quarta pergunta' }, maxRedirects: 0 })
    const falha = page.waitForEvent('requestfailed', (req) => req.url().endsWith('/questions.json'))
    await page.clock.runFor(15_000)
    await falha
    await page.evaluate(() => Promise.resolve())
    await page.clock.runFor(200)
    await expect(page.locator('article.question-wrapper')).toHaveCount(3)
    await expect(page.locator('#questions-status')).toHaveText('2 perguntas novas.')
    await page.unroute('**/questions.json')
    await umaVolta(page)
    await expect(page.locator('article.question-wrapper')).toHaveCount(4)
    await expect(page.locator('#questions-status')).toHaveText('1 pergunta nova.')
    expect(erros).toEqual([])

    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    expect(violations.map((v) => v.id)).toEqual([])
})
/* fim de atualizacao.e2e.js */

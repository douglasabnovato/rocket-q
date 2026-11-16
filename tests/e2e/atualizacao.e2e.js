/*
 * atualizacao.e2e.js · a lista da sala se atualiza a cada 15 s sem recarregar (#10).
 * O relógio do Playwright avança o tempo; a pergunta nova chega por outra "pessoa" (request).
 */
const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

test.beforeEach(async ({ context }) => {
    await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
})

test('pergunta de outra pessoa aparece sem recarregar e é anunciada', async ({ page, request }) => {
    await page.clock.install()
    await page.goto('/create-pass')
    await page.getByLabel('Senha de administração da sala').fill('senha-de-teste-2')
    await page.getByRole('button', { name: 'Criar sala' }).click()
    await expect(page).toHaveURL(/\/room\/\d{6}\?ok=sala-criada$/)
    const codigo = page.url().match(/\/room\/(\d{6})/)[1]
    await expect(page.getByText('Nenhuma pergunta por aqui...')).toBeVisible()

    // Marca a página: se ela recarregar, a marca some.
    await page.evaluate(() => { window.semRecarregar = true })

    // Sem mudança, a volta de 15 s não mexe na lista nem avisa.
    await page.clock.runFor(15_000)
    await expect(page.locator('#questions-status')).toHaveText('')

    const resposta = await request.post(`/question/create/${codigo}`, {
        form: { question: 'Chegou <b>sem</b> recarregar?' },
        maxRedirects: 0
    })
    expect(resposta.status()).toBe(303)

    await page.clock.runFor(15_000)
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

    // Com o diálogo aberto, a lista não muda, mesmo com pergunta nova.
    await request.post(`/question/create/${codigo}`, { form: { question: 'Segunda pergunta' }, maxRedirects: 0 })
    await page.clock.runFor(15_000)
    await expect(page.locator('article.question-wrapper')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(dialogo).toBeHidden()

    // Fechado o diálogo, a próxima volta traz a segunda pergunta.
    await page.clock.runFor(15_000)
    await expect(page.locator('article.question-wrapper')).toHaveCount(2)
    await expect(page.locator('#questions-status')).toHaveText('1 pergunta nova.')

    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    expect(violations.map((v) => v.id)).toEqual([])
})
/* fim de atualizacao.e2e.js */

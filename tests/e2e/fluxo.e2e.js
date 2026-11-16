/*
 * fluxo.e2e.js · fluxo principal no navegador (Playwright + axe).
 * Criar sala, perguntar, errar a senha, marcar como lida só com teclado,
 * Esc no diálogo, sala inexistente e a tela de 375 px.
 * O app não tem tema escuro próprio (nenhum prefers-color-scheme no CSS), então não há teste escuro.
 */
const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const SENHA = 'senha-de-teste-1'

/* Corta a rede externa (Google Fonts): o teste não depende de internet. */
test.beforeEach(async ({ context }) => {
    await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort())
})

/* Roda o axe na página (ou só no seletor) e exige zero violações. */
async function semViolacoes(page, seletor) {
    let builder = new AxeBuilder({ page }).withTags(WCAG)
    if (seletor) builder = builder.include(seletor)
    const { violations } = await builder.analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
}

/* Aperta Tab até o foco chegar no elemento; falha se não chegar em 40 passos. */
async function tabAte(page, alvo) {
    for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab')
        if (await alvo.evaluate((el) => el === document.activeElement)) return
    }
    throw new Error('O foco não chegou ao elemento com Tab')
}

/* Cria a sala pela tela e devolve o código. */
async function criarSala(page) {
    await page.goto('/create-pass')
    await page.getByLabel('Senha de administração da sala').fill(SENHA)
    await page.getByRole('button', { name: 'Criar sala' }).click()
    await expect(page).toHaveURL(/\/room\/\d{6}\?ok=sala-criada$/)
    return page.url().match(/\/room\/(\d{6})/)[1]
}

/* Envia uma pergunta pela tela da sala. */
async function perguntar(page, texto) {
    await page.getByLabel('O que você quer perguntar?').fill(texto)
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Pergunta enviada.' })).toBeVisible()
}

test('cria a sala, pergunta, recusa a senha errada e marca como lida só com teclado', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Entre como participante' })).toBeVisible()
    await semViolacoes(page)

    await page.getByRole('link', { name: 'Criar sala' }).click()
    await expect(page.getByRole('heading', { name: 'Crie sua própria sala' })).toBeVisible()
    await semViolacoes(page)

    const codigo = await criarSala(page)
    await expect(page.getByText('Sala criada! Compartilhe o código com o público.')).toBeVisible()
    await expect(page.getByText('Nenhuma pergunta por aqui...')).toBeVisible()
    await semViolacoes(page)

    await perguntar(page, 'Como funciona o limite de tentativas?')
    const pergunta = page.locator('article.question-wrapper').filter({ hasText: 'Como funciona o limite de tentativas?' })
    await expect(pergunta).toBeVisible()

    // Senha errada: a mensagem aparece e nada muda.
    await pergunta.getByRole('button', { name: 'Excluir' }).click()
    const dialogo = page.getByRole('dialog')
    await expect(dialogo).toBeVisible()
    await semViolacoes(page, '.modal')
    await dialogo.getByLabel('Senha de administração da sala').fill('senha-errada')
    await dialogo.getByRole('button', { name: 'Sim, excluir' }).click()
    await expect(page).toHaveURL(new RegExp(`/room/${codigo}\\?erro=senha$`))
    await expect(page.getByRole('alert')).toHaveText('Senha incorreta. Nenhuma alteração foi feita.')
    await expect(pergunta).toBeVisible()
    await expect(pergunta).not.toHaveClass(/read/)
    await semViolacoes(page)

    // Só teclado: Tab até "Marcar como lida", Enter, digita a senha, Tab até confirmar.
    const marcar = pergunta.getByRole('button', { name: 'Marcar como lida' })
    await tabAte(page, marcar)
    const contorno = await marcar.evaluate((el) => {
        const estilo = getComputedStyle(el)
        return `${estilo.outlineStyle} ${estilo.outlineWidth}`
    })
    expect(contorno).toBe('solid 3px')
    await page.keyboard.press('Enter')
    const senha = dialogo.getByLabel('Senha de administração da sala')
    await expect(senha).toBeFocused()
    await page.keyboard.type(SENHA)
    await page.keyboard.press('Tab')
    await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused()
    await page.keyboard.press('Tab')
    const confirmar = dialogo.getByRole('button', { name: 'Sim, marcar como lida' })
    await expect(confirmar).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(new RegExp(`/room/${codigo}\\?ok=marcada$`))
    await expect(page.getByText('Pergunta marcada como lida.')).toBeVisible()
    const lida = page.locator('article.question-wrapper.read').filter({ hasText: 'Como funciona o limite de tentativas?' })
    await expect(lida).toBeVisible()
    await expect(lida.getByRole('button', { name: 'Marcar como lida' })).toHaveCount(0)
    await semViolacoes(page)
})

test('Esc fecha o diálogo, limpa a senha e devolve o foco ao botão', async ({ page }) => {
    await criarSala(page)
    await perguntar(page, 'Pergunta para testar o diálogo')
    const excluir = page.locator('article.question-wrapper').getByRole('button', { name: 'Excluir' })
    await tabAte(page, excluir)
    await page.keyboard.press('Enter')
    const dialogo = page.getByRole('dialog')
    await expect(dialogo).toBeVisible()
    await page.keyboard.type('qualquer')

    // O Tab fica preso no diálogo: do último botão volta ao campo de senha.
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(dialogo.getByLabel('Senha de administração da sala')).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialogo).toBeHidden()
    await expect(excluir).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(dialogo.getByLabel('Senha de administração da sala')).toHaveValue('')
})

test('código de sala inexistente mostra o aviso na entrada', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Código da sala (6 dígitos)').fill('000001')
    await page.getByRole('button', { name: 'Entrar na sala' }).click()
    await expect(page.getByRole('alert')).toHaveText('Sala não encontrada. Confira o código.')
    await semViolacoes(page)

    await page.goto('/room/000001')
    await expect(page.getByRole('heading', { name: 'Sala não encontrada.' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Voltar para o início' })).toBeVisible()
    await semViolacoes(page)
})

test('no celular (375 px) as telas não rolam para o lado e passam no axe @celular', async ({ page }) => {
    const semRolagemLateral = async () => {
        const larguras = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
        expect(larguras[0]).toBeLessThanOrEqual(larguras[1])
    }
    await page.goto('/')
    await semRolagemLateral()
    await semViolacoes(page)

    await criarSala(page)
    await perguntar(page, 'Uma pergunta bem longa para conferir a quebra de linha na tela estreita do celular, sem rolagem lateral nenhuma')
    await semRolagemLateral()
    await semViolacoes(page)
})
/* fim de fluxo.e2e.js */

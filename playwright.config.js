/*
 * playwright.config.js · teste de ponta a ponta no navegador.
 * Sobe o servidor real com SQLite em memória numa porta própria.
 * O limite de 10 tentativas por minuto vale para o servidor inteiro:
 * por isso um worker só, sem nova tentativa, e o projeto de 375 px só roda os testes @celular.
 * Orçamento em 16/11/2026: 4 criações de sala e 2 ações com senha (6 de 10). Teste novo com senha conta aqui.
 * O projeto "celular" é o Chromium de desktop com 375 px de largura (sem toque nem isMobile).
 */
const { defineConfig, devices } = require('@playwright/test')

const PORT = Number(process.env.E2E_PORT) || 3471

module.exports = defineConfig({
    testDir: 'tests/e2e',
    testMatch: /.*\.e2e\.js$/,
    timeout: 60_000,
    workers: 1,
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
        reducedMotion: 'reduce'
    },
    projects: [
        { name: 'desktop', grepInvert: /@celular/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
        { name: 'celular', grep: /@celular/, use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } }
    ],
    webServer: {
        command: 'node src/server.js',
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: false,
        timeout: 60_000,
        env: { PORT: String(PORT), DATABASE_FILE: ':memory:', BCRYPT_COST: '4', TRUST_PROXY: '0' }
    }
})
/* fim de playwright.config.js */

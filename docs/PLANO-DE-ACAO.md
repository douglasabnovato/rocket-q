# Plano de ação — Rocket.Q

Priorização por **MoSCoW** e ordenação por **ganho ÷ esforço** (esforço: 1 = até 15 min, 2 = até 30 min, 3 = até 1 h).

| # | Prioridade | Tarefa | Defeito | Critério | Ganho | Esforço | Status |
|---|---|---|---|---|---|---|---|
| T01 | Must | Repositórios com SQL parametrizado (*prepared statements*) | D1 | C4 | Alto | 2 | ✅ Feito |
| T02 | Must | Hash bcrypt da senha e comparação com `bcrypt.compare` | D2 | C4 | Alto | 1 | ✅ Feito |
| T03 | Must | Moderação restrita à sala (`WHERE id = ? AND room_id = ?`) | D3 | C4 | Alto | 1 | ✅ Feito |
| T04 | Must | Tratamento centralizado de erros (404/500) e validação de entrada | D4 | C2, C4 | Alto | 2 | ✅ Feito |
| T05 | Must | Schema v1 em 3FN com FK, `CHECK`, índice e migração automática do banco legado | D10, D11 | C5 | Alto | 2 | ✅ Feito |
| T06 | Must | Código da sala com `crypto.randomInt` + PK (novo sorteio em colisão) | D5 | C1, C8 | Médio | 1 | ✅ Feito |
| T07 | Should | Mensagens de sucesso/erro com PRG; sala inexistente com aviso; fim do `confirm()` | D6 | C2 | Alto | 2 | ✅ Feito |
| T08 | Should | Acessibilidade: `lang`, rótulos válidos, botões nativos, foco visível, modal com foco/Esc, contraste AA | D7 | C3 | Médio | 2 | ✅ Feito |
| T09 | Should | Copiar código da sala com anúncio para leitor de tela | RF06 | C1 | Médio | 1 | ✅ Feito |
| T10 | Should | Imagem de fundo: PNG 2160 px → WebP 1080 px embutido (4,6 MB → 51 KB) | D8 | C8 | Alto | 1 | ✅ Feito |
| T11 | Should | 12-Factor: `PORT`, `DATABASE_FILE`, `start` com `node`, desligamento limpo, `.env.example` | D9 | C9 | Médio | 1 | ✅ Feito |
| T12 | Should | `helmet` (CSP) e `express-rate-limit` nas rotas com senha | — | C4 | Médio | 1 | ✅ Feito |
| T13 | Should | 14 testes de integração (`node:test` + `supertest`) | — | C6 | Alto | 3 | ✅ Feito |
| T14 | Could | Layout responsivo em uma coluna abaixo de 768 px | README item 1 | C3 | Médio | 1 | ✅ Feito |
| T15 | Should | README com execução, rotas, deploy gratuito e licença coerente | D12 | C10 | Médio | 1 | ✅ Feito |
| T16 | Must (usuário) | Apagar `src/views/passincorrect.ejs`; rodar `npm install` para instalar as novas dependências | — | C7 | Baixo | 1 | ⏳ Com você |
| T17 | Won't (agora) | Tempo real (SSE/WebSocket), expiração de salas, modo escuro | — | C1 | — | — | Roadmap |

## Definição de pronto

- `npm test` verde (14/14).
- axe-core sem violações WCAG 2.2 AA na página inicial, na sala (com mensagens) e na página de erro.
- Nenhuma consulta SQL montada por concatenação (`grep -rn '\${' src/repositories` vazio).

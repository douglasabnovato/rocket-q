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

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `main`. Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Quem dá aula ou palestra quer receber perguntas do público sem expor quem pergunta, e organizar o que já respondeu.

**Hipótese e meta.** Criar sala e registrar uma pergunta em menos de 1 minuto. Sem medição de uso (N1).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| O público vota nas perguntas dos outros, e as mais votadas sobem | Virou a #8, com voto limitado por navegador e ordem por votos entre as não lidas | [Slido Community: moderar e gerenciar perguntas](https://community.slido.com/audience-q-a-42/use-moderation-and-manage-audience-questions-477) |
| Moderação antes de publicar ajuda em públicos grandes e anônimos | Virou a #9, opcional por sala e desligada por padrão | [Webex: moderar perguntas no Slido](https://help.webex.com/nr8tx73/), [KAUST: guia do Slido](https://it.kaust.edu.sa/KB/slido/) |
| Testar a entrada do público antes do evento | Percorremos no navegador a criação da sala, a pergunta e os erros; o teste automatizado do percurso virou a #11 | [KAUST: guia do Slido](https://it.kaust.edu.sa/KB/slido/) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Conferir no navegador as telas de erro e senha incorreta | Médio | Baixo | Este ciclo |
| 2 | Zerar os alertas do `npm audit` (trocar `nodemon` por `node --watch`) | Médio | Baixo | Este ciclo |
| 3 | CI também nos PRs para `developer/**` | Alto | Baixo | Este ciclo |
| 4 | Votos nas perguntas | Alto | Médio | Issue #8 |
| 5 | Atualizar a lista sem recarregar | Médio | Médio | Issue #10 |
| 6 | Teste de interface do fluxo | Médio | Médio | Issue #11 |
| 7 | Moderação opcional | Médio | Médio | Issue #9 |
| 8 | Proteger a `main` | Alto | Baixo | Responsável (#7) |

**Fora do escopo.** Contas, WebSocket, votos negativos.

### Engenharia

**Arquitetura.** Express 4 com EJS no servidor, em camadas: rotas (`src/route.js`), controllers, services com as regras e repositories com `better-sqlite3` 12. As senhas das salas usam bcrypt; `src/db/migrations.js` converte o banco antigo. O Render publica a `main` com SQLite em disco temporário.

**Riscos.**
- No Render, as salas somem a cada deploy ou reinício.
- Sem proteção na `main`, um push direto vai ao ar sem CI (#7).
- Perguntas anônimas sem moderação (#9).

**Qualidade.**
- Testes: 14 com `node:test` e `supertest` (sala, senha, XSS, injeção de SQL, IDOR, 404, 429, cabeçalhos, migração).
- Acessibilidade: foco visível, rótulos nos botões, status de cópia anunciado.
- Segurança: bcrypt, limite de tentativas, helmet; `npm audit` sem alertas.

**Definição de pronto.** `npm ci` e `npm test` passam; CI verde no PR; `docs/MVP.md` e README atualizados; link publicado responde.

### Plano de ação

**Este ciclo executa.** Itens 1 a 3 do backlog e a revisão do `MVP.md` pela régua N1 e pela decisão do critério 10.

**Vira issue.** #8, #9, #10, #11 (agente); #7 (responsável).

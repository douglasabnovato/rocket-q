# MVP — rocket-q

> Criado em 02/11/2026. Revisto em 16/11/2026 (ciclo de 16/11; critério 9 revisto às 12h17, com os alertas do Dependabot ligados). **Nível: Estudo (N1).** Meta: N1. Testado no Windows com Node 24 e no CI com Node 22. Sem link publicado deste código: `https://rocket-q.onrender.com` responde, mas serve outro HTML (ver critério 12 e #17). Não houve teste com pessoas nem em aparelho real.

**Resumo:** 10 de 10 aplicáveis atendidos

**Finalizado:** sim (todos os critérios aplicáveis atendem; o 9 passou a "Atende" em 16/11/2026, com os alertas do Dependabot ligados, #18)

## 1. Critérios

Régua N1: os critérios 5 e 7 são "Não se aplica (N1)" e saem do denominador. Antes deste ciclo, o resumo dizia 10 de 10. Pela coluna de evidência da régua, eram 6 de 10: os critérios 3 e 8 não tinham teste no navegador nem axe no CI, o 9 contava só o `npm audit`, e o 12 citava um link publicado que não serve este código.

| # | Critério | Como verificar | Situação (16/11/2026) |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem dá aula ou palestra recebe perguntas anônimas numa sala com código e senha (README, seção "Projeto"). |
| 2 | Hipótese a validar | Aposta escrita, com meta | Atende: seção 2, com meta e "saberemos quando". |
| 3 | Fluxo principal completo | Teste de ponta a ponta no navegador passando no CI | Atende: `npm run test:e2e` (Playwright 1.65.1, Chromium) no job `e2e` do run [43808152524](https://github.com/douglasabnovato/rocket-q/actions/runs/43808152524), em 16/11/2026: `5 passed`. O teste `cria a sala, pergunta, recusa a senha errada e marca como lida só com teclado` faz o percurso por POST real do navegador. Local, em 16/11/2026: `5 passed`. |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). |
| 6 | Falhas tratadas | Testes de erro, vazio e espera | Atende: no navegador (run 43808152524, 16/11/2026), senha errada mostra "Senha incorreta. Nenhuma alteração foi feita." e não altera a pergunta; código inexistente mostra "Sala não encontrada. Confira o código."; sala vazia mostra "Nenhuma pergunta por aqui...". Em `npm test` (18 de 18, 16/11/2026): pergunta vazia, sala inexistente, ação desconhecida, 429 e `questions.json` de sala inexistente (404 em JSON). Sem rede, a atualização da lista espera a falha da consulta, mantém a lista e o aviso, não gera erro na página e traz a pergunta na volta seguinte (teste `pergunta de outra pessoa aparece sem recarregar e é anunciada`). Não há tela de carregamento: as páginas vêm prontas do servidor. |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe (`@axe-core/playwright` 4.14.0, etiquetas WCAG 2.0 a 2.2 A e AA) sem violações na entrada, na criação, na sala vazia, na sala com mensagens, no diálogo e na página de erro, a 1280 px; a 375 px de largura (Chromium de desktop, sem emulação de toque), o axe roda na entrada e na sala com pergunta, sem rolagem lateral, no run 43808152524 de 16/11/2026. Teclado: Tab até "Marcar como lida" com contorno `solid 3px`, Enter abre o diálogo com o foco na senha, Tab preso no diálogo, Esc fecha e devolve o foco. O app não tem tema escuro próprio (nenhum `prefers-color-scheme` no CSS), por isso não há teste escuro. |
| 9 | Segurança e conformidade | `npm audit --omit=dev` e alertas do Dependabot | Atende: `gh api "repos/douglasabnovato/rocket-q/dependabot/alerts?state=open&per_page=100"` em 16/11/2026 às 11h59: 0 alertas abertos (alertas ligados pelo responsável nesse dia, #18). `npm audit --omit=dev` depois do `npm ci`, em 16/11/2026 às 12h17: `found 0 vulnerabilities`. Sem segredo no código (`.env` fora do Git). Senhas das salas com bcrypt e limite de 10 tentativas por minuto (teste do 429). Dados pessoais: nenhum; as perguntas são anônimas. |
| 10 | Entrega confiável | CI nos PRs e principal protegida | Atende: `gh api repos/douglasabnovato/rocket-q/rulesets` em 16/11/2026: ruleset `principal-protegida` ativo (PR obrigatório, sem force push, sem exclusão, check `raiz` exigido). O workflow `CI` roda os jobs `raiz` e `e2e` em PR e push para `main` e `developer/**`. Exigir também o `e2e` no ruleset é do responsável (#20). |
| 11 | Testes dos fluxos críticos | Testes no CI, sem `# skipped` | Atende: run 43808152524, em 16/11/2026: job `raiz` com `# tests 18`, `# pass 18`, `# skipped 0`; job `e2e` com `5 passed`. |
| 12 | Documentação honesta | README conferido contra o `package.json`; link só se responder hoje | Atende: os comandos do README (`npm install`, `npm run dev`, `npm start`, `npm test`, `npm run test:e2e`, `npm run init-db`) conferidos contra o `package.json` em 16/11/2026. O README não cita mais `https://rocket-q.onrender.com`: em 16/11/2026 ele respondeu 200 com outro HTML (`<title>Criar Sala - Rocket.Q</title>`, `x-powered-by: Express`, sem os cabeçalhos do `helmet`), que não é o da `main` (#17). |

## 2. Hipótese

Acreditamos que uma sala com código e senha deixa quem apresenta criar a sala e receber a primeira pergunta em menos de 1 minuto, sem conta e sem ajuda. Meta: o percurso inteiro (criar a sala, perguntar, moderar com a senha) roda no navegador, de ponta a ponta. Saberemos quando o teste Playwright do fluxo principal passar no CI a cada PR, como no run 43808152524 (16/11/2026). Em N1 não há medição com pessoas.

## 3. Fora do MVP

Contas de usuário, tempo real com WebSocket, votos negativos, tema escuro e disco persistente na hospedagem. Votos (#8) e moderação opcional (#9) são próximos passos.

## 4. Neste ciclo (16/11/2026)

Teste Playwright do fluxo com axe e teclado no CI (#11), lista de perguntas atualizada a cada 15 s sem recarregar (#10), critério 9 pela regra do Dependabot desligado e o link publicado retirado do README. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md), seção "Ciclo de 16/11/2026".

## Histórico

- 16/11/2026, 12h17: critério 9 de "Parcial" para "Atende". Antes, a API de alertas do Dependabot respondia 403 (alertas desligados, engenharia#33). Com os alertas ligados, 0 abertos e audit de produção 0. Resumo de 9 para 10 de 10.

- 10/11/2026: o resumo dizia 10 de 10, com o critério 10 em "Atende" pela proteção da `main` (#7).
- 06/11/2026: ciclo de 03/11, com `nodemon` trocado por `node --watch` e CI nos PRs para `developer/**`.

# MVP — rocket-q

> Criado em 02/11/2026. Revisto em 06/11/2026 (ciclo de 03/11). **Nível: Estudo (N1).** Meta: N1. Testado no Windows com Node 24 e no CI com Node 22. Link publicado: https://rocket-q.onrender.com respondeu 200 em 06/11/2026. Não houve teste com pessoas nem em aparelho real.

**Resumo:** 10 de 10 aplicáveis atendidos

**Finalizado:** sim

## 1. Critérios: 10 de 10 aplicáveis atendidos

Régua N1: os critérios 5 e 7 são "Não se aplica (N1)" e saem do denominador. Antes deste ciclo, pela mesma régua: 7 de 10 (o critério 10 passava por "Atende" sem a principal protegida).

| # | Critério | Como verificar | Situação (06/11/2026) |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem dá uma palestra recebe perguntas anônimas numa sala com senha. |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: seção 2; ainda sem validação com pessoas. |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: no navegador, com SQLite local, em 06/11: sala criada, pergunta enviada e exibida. |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: conferido no navegador em 06/11: sala inexistente mostra "Sala não encontrada." com link de volta; senha errada mostra "Senha incorreta. Nenhuma alteração foi feita." e não altera a pergunta. Também coberto pelos 14 testes. |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações em 02/11; foco visível; sem rolagem em 375 px; botões com rótulo acessível. |
| 9 | Segurança e conformidade | Riscos decididos | Atende: `npm audit` sem alertas em 06/11 (os 2 moderados vinham do `nodemon`, trocado por `node --watch`). Senhas com bcrypt; limite de 10 tentativas por minuto. |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Atende (10/11/2026): `gh api repos/douglasabnovato/rocket-q/rulesets`, em 10/11/2026: ruleset `principal-protegida` ativo (exige PR, bloqueia force push e exclusão); workflow `CI` roda nos PRs para `main` e `developer/**`. O Render publica a cada commit na `main`, que agora só chega por PR (#7). |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 14 testes no CI. |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`; link publicado conferido. |

Todos os critérios aplicáveis atendem. O 10 passou a "Atende" em 10/11/2026, com a proteção da `main` (#7).

## 2. Hipótese (proposta)

Praticar Node e SQLite: criar sala e registrar uma pergunta em menos de 1 minuto.

## 3. Fora do MVP

Contas e tempo real com WebSocket.

## 4. Neste ciclo (06/11/2026)

Telas de erro e senha incorreta conferidas no navegador, `nodemon` trocado por `node --watch` (alertas zerados) e CI nos PRs para `developer/**`. Detalhes em [PLANO-DE-ACAO.md](PLANO-DE-ACAO.md).

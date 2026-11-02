# MVP — rocket-q

> Criado em 02/11/2026. Meta: N1 (estudo). Testado no Windows, com Node 24, na cópia de `main`. Não houve teste com pessoas nem em aparelho real.

## 1. Critérios: 8 de 12 atendidos

| # | Critério | Como verificar | Situação |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: Quem dá uma palestra recebe perguntas em uma sala com senha. |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: Proposta na seção 2; ainda sem validação com pessoas. |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: No navegador, com SQLite local: sala criada e pergunta exibida. |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: Seção 3. |
| 5 | Medição de uso | A métrica principal é coletada | Não atende: Projeto de estudo sem coleta de uso. |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Parcial: Telas de erro e senha incorreta existem; não foram exercitadas no navegador. |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não medido: Sem publicação verificada neste ciclo. |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações; foco visível; sem rolagem em 375 px. |
| 9 | Segurança e conformidade | Riscos decididos | Parcial: Restam 4 alertas moderados, pós-`npm audit fix`. |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Atende: CI verde no PR deste ciclo; a principal segue sem proteção. |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: Testes automatizados rodam no CI. |
| 12 | Documentação honesta | O README ensina a rodar | Atende: Comandos conferidos com o `package.json`; aviso de estudo no README. |

## 2. Hipótese (proposta)

Praticar Node e SQLite: criar sala e registrar uma pergunta em menos de 1 minuto.

## 3. Fora do MVP

Contas e tempo real.

## 4. Neste ciclo

Atualiza dependências com alerta.

# Análise do projeto — Rocket.Q

> Data da análise: 27/09/2026 · Branch analisada: `main` · Grupo: **fullstack (SSR)**

## 1. Contexto de produto

| Item | Descrição |
|---|---|
| Problema | Em aulas, lives e reuniões, parte do público não pergunta por timidez ou porque a pergunta se perde no chat. |
| Público | Quem apresenta (dono da sala) e quem assiste (participante anônimo). |
| Proposta de valor | Criar uma sala em segundos, compartilhar um código de 6 dígitos e receber perguntas anônimas; só quem tem a senha marca como lida ou exclui. |
| Origem | NLW Together 6, trilha Mission: Discover (Rocketseat), evoluído como produto de portfólio. |
| Métrica norte (proposta) | Perguntas recebidas por sala criada. |

## 2. Especificação de requisitos

### 2.1 Requisitos funcionais

| ID | Requisito | Situação encontrada |
|---|---|---|
| RF01 | Criar sala protegida por senha e receber um código único. | Atende parcialmente: a checagem de código repetido nunca funciona (compara objeto com texto). |
| RF02 | Entrar numa sala pelo código. | Atende parcialmente: código inexistente abre uma sala "fantasma" vazia. |
| RF03 | Enviar pergunta anônima. | Atende parcialmente: aceita pergunta vazia e envia para sala inexistente. |
| RF04 | Dono marca pergunta como lida (com senha). | Atende parcialmente: clicar no ícone em vez do texto envia `undefined` como id. |
| RF05 | Dono exclui pergunta (com senha). | Atende parcialmente: mesmo defeito do RF04; e a senha de uma sala exclui perguntas de **outra** sala. |
| RF06 | Copiar o código da sala. | **Não atende**: o ícone de copiar não tem ação. |
| RF07 | Ver perguntas não lidas antes das lidas. | Atende |

### 2.2 Requisitos não funcionais (ISO/IEC 25010)

| ID | Característica | Requisito | Situação |
|---|---|---|---|
| RNF01 | Segurança | Consultas parametrizadas, senha com hash, autorização por sala. | **Não atende** (D1–D3) |
| RNF02 | Confiabilidade | Sala inexistente não pode derrubar a requisição. | **Não atende** (D4) |
| RNF03 | Usabilidade | Feedback de sucesso e erro sem `confirm()` do navegador. | Não atende (D6) |
| RNF04 | Acessibilidade | WCAG 2.2 AA: rótulos válidos, foco visível, controles nativos. | Não atende (D7) |
| RNF05 | Eficiência | Página inicial abaixo de 500 KB. | Não atende: imagem de fundo com 4,6 MB (D8) |
| RNF06 | Portabilidade | Rodar em hospedagem gratuita (porta e caminho do banco por variável). | Não atende (D9) |

### 2.3 Regras de negócio

- RN01 — O código da sala tem 6 dígitos e é único.
- RN02 — A senha da sala tem de 6 a 72 caracteres (limite do bcrypt).
- RN03 — A pergunta tem de 1 a 500 caracteres, sem identificação de quem perguntou.
- RN04 — Só a senha **da própria sala** autoriza marcar como lida ou excluir uma pergunta dela.

## 3. Diagnóstico (defeitos encontrados)

| ID | Severidade | Onde | Defeito | Referência |
|---|---|---|---|---|
| D1 | **Crítica** | `QuestionController`, `RoomController` | SQL montado por interpolação (`WHERE id = ${roomId}`, `VALUES("${question}")`): injeção de SQL por qualquer formulário. | OWASP Top 10 A03 (Injection); CWE-89 |
| D2 | **Crítica** | tabela `rooms` | Senha gravada em texto puro. | OWASP A02 (Cryptographic Failures); ASVS V2.4 |
| D3 | **Crítica** | `QuestionController.index` | `DELETE ... WHERE id = ?` não filtra pela sala: com a senha da sala A exclui-se pergunta da sala B. | OWASP A01 (Broken Access Control) — IDOR; CWE-639 |
| D4 | Alta | `QuestionController.index` | Sala inexistente → `verifyRoom.pass` em `undefined` → promessa rejeitada sem tratamento; no Node 15+ derruba o processo (negação de serviço). | Tratamento centralizado de erros |
| D5 | Alta | `RoomController.create` | Checagem de código repetido sempre falsa e com varredura completa da tabela (O(n)); código com zero à esquerda vira outro número. | Unicidade garantida pela chave primária + `crypto.randomInt` |
| D6 | Média | `passincorrect.ejs` | Senha errada abre `confirm()` e recarrega; sucesso não tem feedback. | Heurísticas de Nielsen nº 1 e nº 9 |
| D7 | Média | views | `for-id` (atributo inexistente), `div` e `a href="#"` como botões, `outline: none`, modal sem foco nem tecla Esc, `<html>` sem `lang`. | WCAG 2.2 — 1.3.1, 2.1.1, 2.4.7, 3.1.1, 4.1.2 |
| D8 | Média | `home-bg-img.svg` | SVG com PNG 2160×2160 embutido (4,6 MB) para uma área de ~640 px. | Core Web Vitals (LCP) |
| D9 | Média | `server.js`, `db/config.js`, `package.json` | Porta fixa 3000, caminho do banco relativo ao diretório atual, `start` com `nodemon` (dependência de desenvolvimento), `init-db` falha se rodar duas vezes. | 12-Factor III (Config), V (Build/Run), VII (Port binding) |
| D10 | Média | `db/config.js` | Uma conexão aberta por requisição e nunca fechada (vazamento de *file handles*). | Gerência de recursos |
| D11 | Baixa | modelo | Sem `NOT NULL`, sem chave estrangeira, sem índice por sala. | 3FN e integridade referencial |
| D12 | Baixa | README / package.json | Licença MIT no README e ISC no `package.json`; autor do `package.json` é outra pessoa. | Documentação como contrato |

## 4. Critérios de MVP e nota atual

Pesos do grupo **fullstack**. Aprovação: média ponderada ≥ 7,0 **e** nenhum critério eliminatório (C1 e C4) abaixo de 5.

| # | Critério | Referência | Peso | Nota atual | Justificativa |
|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Eric Ries) | 18% | 7 | Fluxo principal existe, com defeitos em RF01–RF06. |
| C2 | Estados | Nielsen | 10% | 3 | `confirm()`, sala fantasma, sem feedback de sucesso. |
| C3 | Acessibilidade | WCAG 2.2 AA | 8% | 4 | D7. |
| C4 | Segurança | OWASP Top 10 / ASVS L1 | 16% | 1 | D1, D2, D3 e D4. |
| C5 | Dados | 3FN / ACID | 12% | 4 | D10 e D11. |
| C6 | Testes | Pirâmide de testes | 10% | 0 | Nenhum teste. |
| C7 | Qualidade de código | SOLID / camadas | 8% | 4 | SQL no controller, D5, D10. |
| C8 | Desempenho | Core Web Vitals / complexidade | 6% | 3 | D8 e varredura O(n). |
| C9 | Operação | 12-Factor | 6% | 3 | D9. |
| C10 | Documentação | README | 6% | 5 | Bom visual; faltam execução e contrato de rotas; D12. |

**Nota atual: 3,50 / 10 — REPROVADO** (média abaixo de 7,0 e C4 eliminatório com nota 1).

### 4.1 Critérios de aceite do MVP (BDD)

```gherkin
Funcionalidade: Sala de perguntas anônimas

  Cenário: Injeção de SQL na pergunta
    Dado uma sala existente
    Quando envio a pergunta 'x"); DROP TABLE rooms; --'
    Então a pergunta aparece exatamente como digitada
    E a tabela de salas continua existindo

  Cenário: Senha de outra sala
    Dado as salas A e B com senhas diferentes
    Quando uso a senha da sala A para excluir uma pergunta da sala B
    Então recebo "Senha incorreta" e a pergunta continua lá

  Cenário: Código inexistente
    Quando tento entrar na sala "999999" que não existe
    Então vejo "Sala não encontrada" na página inicial

  Cenário: Senha guardada com segurança
    Quando crio uma sala com a senha "segredo1"
    Então o banco guarda apenas o hash bcrypt da senha

## 5. Nota depois do ciclo de melhorias (27/09/2026)

| # | Critério | Antes | Depois | O que mudou |
|---|---|---|---|---|
| C1 | Núcleo de valor | 7 | 9 | RF01–RF07 atendidos, incluindo copiar código e sala inexistente. |
| C2 | Estados | 3 | 9 | Mensagens de sucesso e erro (PRG), páginas 404/429/500, estado vazio anunciado. |
| C3 | Acessibilidade | 4 | 8 | axe-core: 0 violações WCAG 2.2 AA nas três telas; modal com foco preso e Esc; contraste corrigido (`--blue` #1A66D9, `--red` #D42E4A). |
| C4 | Segurança | 1 | 8 | SQL parametrizado, bcrypt, autorização por sala, CSP, limite de tentativas, corpo limitado a 10 KB, saída escapada. |
| C5 | Dados | 4 | 9 | 3FN com FK, `CHECK`, índice composto, migração transacional do banco legado. |
| C6 | Testes | 0 | 8 | 14 testes de integração cobrindo os cenários BDD. |
| C7 | Qualidade de código | 4 | 8 | Camadas controller → service → repository com injeção de dependência. |
| C8 | Desempenho | 3 | 8 | Página inicial ~4,6 MB mais leve; consultas por índice; *prepared statements* reutilizados; cache de estáticos por 7 dias. |
| C9 | Operação | 3 | 8 | `PORT`, `DATABASE_FILE`, `TRUST_PROXY`, `npm start` com Node, schema criado na subida, desligamento limpo. |
| C10 | Documentação | 5 | 8 | README com execução, rotas e deploy; `docs/` completo; licença coerente. |

**Nota depois: 8,40 / 10 — APROVADO** (C1 = 9 e C4 = 8).

Verificação: `npm test` (14/14); navegação real com Playwright (criar sala → 2 perguntas → senha errada) e axe-core sem violações.

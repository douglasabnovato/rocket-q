> **Projeto de estudo.** Estado conferido em 30/10/2026: 1 endereço(s) citado(s) abaixo não responde(m). Detalhes em [docs/AVALIACAO.md](docs/AVALIACAO.md) e próximos passos em [docs/PLANO-ESTRATEGICO.md](docs/PLANO-ESTRATEGICO.md).

<h4 align="center"> 
  Rocket.Q 🚀
</h4> 

<p align="center">
  <img alt="Uma aplicação para compartilhar perguntas e respostas" title="Rocket.Q" src="./.github/tela-4.jpg" width="100%">
</p>

<p align="center">
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#%EF%B8%8F-como-executar">Como executar</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-layout">Layout</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-licença">Licença</a>
</p>

<p align="center">
 <img src="https://img.shields.io/static/v1?label=PRs&message=welcome&color=49AA26&labelColor=000000" alt="PRs welcome!" />

  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=49AA26&labelColor=000000">
</p>

<br>

## 💻 Projeto

O Rocket.Q é uma aplicação de interação através de perguntas, sendo possível criar uma sala para internautas anônimos fazerem perguntas e o criador da sala em posse de uma senha gerenciar essas perguntas e marcar como lidas.

## ▶️ Como executar

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev          # desenvolvimento com recarga automática (nodemon)
npm start            # produção: node src/server.js
npm test             # 14 testes de integração (node:test + supertest)
npm run init-db      # opcional: cria/atualiza o banco; o servidor já faz isso ao subir
```

Variáveis de ambiente (veja `.env.example`; para carregar localmente use `node --env-file=.env src/server.js`):

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `DATABASE_FILE` | `src/db/rocketq.sqlite` | Arquivo do SQLite |
| `BCRYPT_COST` | `10` | Custo do hash da senha da sala |
| `TRUST_PROXY` | `0` | Use `1` atrás de proxy (Render, alwaysdata) para o limite de tentativas por IP |

O banco antigo (senha em texto puro) é migrado automaticamente na primeira subida: as senhas viram hash bcrypt e as perguntas órfãs são descartadas. Para conferir o banco, o Beekeeper Studio continua funcionando.

### Rotas

| Método | Rota | O que faz |
|---|---|---|
| GET | `/` | Entrar numa sala pelo código |
| GET | `/create-pass` | Formulário para criar sala |
| POST | `/create-room` | Cria a sala (senha de 6 a 72 caracteres) |
| POST | `/enterroom` | Valida o código e abre a sala |
| GET | `/room/:room` | Perguntas da sala (não lidas primeiro) |
| POST | `/question/create/:room` | Envia pergunta anônima (1 a 500 caracteres) |
| POST | `/question/:room/:question/:action` | `check` ou `delete`, exige a senha da sala |

### Hospedagem gratuita

**Demonstração:** https://rocket-q.onrender.com

- **Render (web service free)**, configurado em `render.yaml`: build `npm ci`, start `npm start`, `TRUST_PROXY=1`. O serviço dorme após 15 min sem acesso (~1 min para acordar) e o disco é apagado a cada deploy/reinício, então as salas são temporárias.
- **alwaysdata (plano gratuito, 100 MB):** alternativa com disco persistente, se as salas precisarem durar.
- Passo a passo completo: [docs/DEPLOY.md](docs/DEPLOY.md).

## 📊 Estado do MVP & Documentação

| Documento | Conteúdo |
|---|---|
| [docs/ANALISE.md](./docs/ANALISE.md) | Requisitos, diagnóstico (OWASP, WCAG, 12-Factor), rubrica e critérios de aceite BDD |
| [docs/ARQUITETURA.md](./docs/ARQUITETURA.md) | C4, camadas, modelo de dados em 3FN, contrato de rotas e ADRs |
| [docs/PLANO-DE-ACAO.md](./docs/PLANO-DE-ACAO.md) | Tarefas priorizadas por MoSCoW e ganho ÷ esforço |

| Momento | Nota MVP | Situação |
|---|---|---|
| Antes (27/09/2026) | 3,50 | Reprovado — injeção de SQL, senha em texto puro e exclusão de perguntas de outra sala |
| Depois (27/09/2026) | 8,40 | Aprovado |


## 🚀 Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- HTML, CSS e JavaScript (módulos ES no navegador)
- EJS (renderização no servidor)
- Node.js 20+ e Express 4
- SQLite com `better-sqlite3`
- `bcryptjs`, `helmet` e `express-rate-limit`
- Testes com `node:test` e `supertest`

## 🎨 Layout - v1.0 - fluxo da aplicação e estrutura no bd

- A home da aplicação podendo criar uma sala ou entrar em uma sala já existente
<p align="center" style="display: flex; align-items: flex-start; justify-content: center;">
  <img alt="Uma aplicação para compartilhar perguntas e respostas" title="Rocket.Q" src="./.github/tela-4.jpg" width="400px">
</p> 

- Se optar por criar a própria sala, criar uma senha.
<p align="center" style="display: flex; align-items: flex-start; justify-content: center;">
  <img alt="Uma aplicação para compartilhar perguntas e respostas" title="Rocket.Q" src="./.github/tela-3.jpg" width="400px">
</p> 

- Se optar por entrar em uma sala, inserir o código. Então verá as perguntas e poderá fazer outras.
<p align="center" style="display: flex; align-items: flex-start; justify-content: center;">
  <img alt="Uma aplicação para compartilhar perguntas e respostas" title="Rocket.Q" src="./.github/tela-1.jpg" width="400px">
</p> 

- Se for o criador da sala, poderá marcar como lida as perguntas.
<p align="center" style="display: flex; align-items: flex-start; justify-content: center;">
  <img alt="Uma aplicação para compartilhar perguntas e respostas" title="Rocket.Q" src="./.github/tela-2.jpg" width="400px">
</p> 

- Visualizando as questões no banco de dados
<p align="center" style="display: flex; align-items: flex-start; justify-content: center;">
  <img alt="Estrutura de bd da aplicação" title="Rocket.Q" src="./.github/tela-5.jpg" width="400px">
</p> 

## 🔖 Detalhes no Notion

Podemos ver mais detalhes do projeto através [desse link](https://www.notion.so/Mission-Discover-f103a00f5ca74e78ad4df757a142bbf7) no Notion.

## 🔖 Layout

Você pode visualizar o layout do projeto através [desse link](https://www.figma.com/community/file/1009821158959690135/Roquet.q). É necessário ter conta no [Figma](https://figma.com) para acessá-lo.

- seguir o design
<p align="center">
  <img alt="Uma aplicação para compartilhar perguntas e respostas" src=".github/capa.png" width="400px">
</p> 

---

### Próximo passo para frontend

- [x] 1. responsividade (uma coluna abaixo de 768 px)
- [x] 2. acessibilidade (WCAG 2.2 AA verificada com axe-core)
- [ ] 3. modo dark / light
- [ ] 4. variação de cores
- [ ] 5. hospedar aplicação

---

## :memo: Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](.github/LICENSE.md) para mais detalhes.

---  

Feito com ❤️ por Douglas A B Novato 👋🏽 [Entre em contato!](https://www.linkedin.com/in/douglasabnovato/).

Fonte do projeto: [NLW Together Edição 6 na trilha Mission: Discover da Rocketseat](https://github.com/maykbrito) 

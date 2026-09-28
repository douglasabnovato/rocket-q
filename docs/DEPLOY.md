# Deploy · Rocket.Q

Plano de ação para publicar as salas de perguntas em hospedagem gratuita.

## 1. Desafio

Publicar um app Node (Express + EJS + SQLite) com senha de sala em bcrypt e limite de tentativas por IP, sem custo e sem quebrar a proteção contra força bruta atrás do proxy da hospedagem.

## 2. Conteúdo

### Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render, serviço web gratuito (escolhida)** | Deploy a cada push, HTTPS, configuração versionada em `render.yaml` |
| alwaysdata (gratuito, 100 MB) | Disco persistente; boa saída se as salas precisarem durar, mas o deploy é manual (FTP/SSH) |

### Pontos de atenção

- `TRUST_PROXY=1`: atrás do proxy do Render, sem isso o `express-rate-limit` enxergaria todos os visitantes com o mesmo IP e bloquearia todo mundo junto.
- Disco temporário: o SQLite é recriado a cada reinício ou deploy (as migrações rodam sozinhas); as salas são descartáveis na demonstração.
- O serviço dorme após 15 min sem acesso e leva cerca de 1 min para acordar.

### O que foi ajustado para o deploy

| Mudança | Arquivo | Por quê |
|---|---|---|
| Blueprint do serviço web | `render.yaml` | Infraestrutura como código, com `TRUST_PROXY=1` já definido |
| Seção de hospedagem com link e limitações | `README.md` | Quem visita sabe o que esperar |

### Verificação feita antes da entrega

- `npm ci` limpo, 14 testes passando (`node --test`), `npm audit --omit=dev` sem vulnerabilidades.
- Servidor iniciado em modo produção com `TRUST_PROXY=1` respondendo 200 na página inicial.

## 3. Solução (passo a passo)

### Etapa 1 · Validar localmente (Git Bash)

1. `cd /c/ambiente-projeto/ser-mvp/rocket-q`
2. `npm ci`
3. `npm test` (14 testes)
4. `npm start` e abrir http://localhost:3000

### Etapa 2 · Subir para o GitHub

1. `git rm src/views/passincorrect.ejs` (substituída pela mensagem dentro da sala)
2. `git status` (não podem aparecer `.env` nem arquivos `.sqlite`)
3. `git add -A`
4. `git commit -m "refactor: MVP — better-sqlite3, bcrypt, camadas, migrations, a11y, testes e deploy no Render"`
5. `git push`

### Etapa 3 · Criar o serviço no Render

1. Entrar em **render.com** com o GitHub e autorizar o repositório `rocket-q`.
2. **New → Blueprint** e escolher `douglasabnovato/rocket-q`.
3. Conferir o serviço `rocket-q`, plano **Free**, e clicar em **Apply**.
4. Acompanhar **Logs** até aparecer `Rocket.Q rodando`.

### Etapa 4 · Conferir no ar

1. Criar uma sala com senha e anotar o código.
2. Em outra aba anônima, entrar pelo código e enviar uma pergunta.
3. Na aba do dono, marcar como lida e excluir com a senha.
4. Errar a senha várias vezes seguidas: aparece o aviso de muitas tentativas.

### Etapa 5 · Fechar

1. Se a URL real for diferente de `https://rocket-q.onrender.com`, corrigir no `README.md`, commit e push.
2. No GitHub, **About → Website**: colar a URL.

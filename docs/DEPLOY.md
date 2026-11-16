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
| Seção de hospedagem com as limitações, sem link até a #17 | `README.md` | Quem visita sabe o que esperar |

### Estado em 16/11/2026

- `https://rocket-q.onrender.com` responde 200, mas não serve o código da `main`: o `title` é `Criar Sala - Rocket.Q` (na `main`: `Entrar numa sala · Rocket.Q`) e a resposta traz `x-powered-by: Express`, sem os cabeçalhos do `helmet`. Pode ser um serviço antigo ou de outra conta. Por isso o README não cita esse endereço. O passo a passo para o responsável está na #17.
- Local, em 16/11/2026: `npm ci`, `npm test` (18 de 18), `npm run test:e2e` (5 de 5, com o servidor real) e `npm audit --omit=dev` (0 vulnerabilidades).

## 3. Solução (passo a passo)

Criar conta, serviço ou mudar configuração no Render é do responsável. Nenhum passo pede segredo: o `render.yaml` só tem `NODE_VERSION`, `TRUST_PROXY` e `BCRYPT_COST`.

### Etapa 1 · Validar localmente (Git Bash)

1. Na pasta do clone: `npm ci`
2. `npm test` (18 testes)
3. `npx playwright install chromium` (uma vez) e `npm run test:e2e` (5 testes no navegador)
4. `npm start` e abrir http://localhost:3000

### Etapa 2 · Conferir se já existe um serviço

1. Entrar em **dashboard.render.com** com a conta do GitHub.
2. Procurar um serviço chamado `rocket-q`.
3. Se existir: abrir **Settings**, conferir **Repository** = `douglasabnovato/rocket-q` e **Branch** = `main`, e clicar em **Manual Deploy → Deploy latest commit**. Pular para a Etapa 4.
4. Se não existir: seguir a Etapa 3.

### Etapa 3 · Criar o serviço pelo Blueprint

1. **New → Blueprint** e escolher `douglasabnovato/rocket-q` (autorizar o repositório, se o Render pedir).
2. Conferir o serviço `rocket-q`, plano **Free**, e clicar em **Apply**.
3. Acompanhar **Logs** até aparecer `Rocket.Q rodando`.
4. Anotar o endereço que o Render mostra no topo do serviço. Se o nome `rocket-q` já for de outra conta, ele vem com sufixo (`rocket-q-xxxx.onrender.com`).

### Etapa 4 · Conferir no ar

1. `curl -s https://<endereço>/ | grep -o "<title>.*</title>"` deve mostrar `Entrar numa sala · Rocket.Q`.
2. `curl -s -D - -o /dev/null https://<endereço>/ | grep -i "content-security-policy"` deve mostrar a CSP do `helmet`.
3. Criar uma sala com senha e anotar o código.
4. Em outra aba anônima, entrar pelo código e enviar uma pergunta. Na aba do dono, ela aparece em até 15 s, sem recarregar.
5. Na aba do dono, marcar como lida e excluir com a senha.

### Etapa 5 · Fechar

1. Responder na #17 com o endereço real.
2. No GitHub, **About → Website**: colar o endereço.
3. O agente do ciclo seguinte põe o link no README e no `docs/MVP.md`, depois de conferir com `curl`.

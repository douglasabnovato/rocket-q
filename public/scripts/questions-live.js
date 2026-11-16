/*
 * questions-live.js · atualiza a lista de perguntas sem recarregar a página.
 * A cada 15 s consulta /room/:room/questions.json e só troca a lista quando algo mudou.
 * Não consulta com a aba oculta nem troca a lista com o diálogo de senha aberto.
 */
export const INTERVALO_MS = 15000

/* Assinatura da lista: ids na ordem e estado (n = não lida, l = lida). */
function assinatura(unread, read) {
    return [...unread.map((q) => `n${q.id}`), ...read.map((q) => `l${q.id}`)].join(',')
}

/* Lê a assinatura da lista que já está na página. */
function assinaturaDaPagina(lista) {
    return [...lista.querySelectorAll('article.question-wrapper')]
        .map((artigo) => `${artigo.classList.contains('read') ? 'l' : 'n'}${artigo.dataset.id}`)
        .join(',')
}

/* Cria um elemento com classe e atributos. */
function el(tag, attrs = {}, filhos = []) {
    const node = document.createElement(tag)
    Object.entries(attrs).forEach(([nome, valor]) => node.setAttribute(nome, valor))
    filhos.forEach((filho) => node.append(filho))
    return node
}

/* Botão de ação igual ao da view room.ejs. */
function botao(acao, id, icone, texto) {
    return el('button', { type: 'button', class: `action ${acao}`, 'data-id': id }, [
        el('img', { src: `/images/${icone}.svg`, alt: '', 'aria-hidden': 'true' }),
        texto
    ])
}

/* Monta o artigo de uma pergunta, com o texto sempre por textContent (sem HTML). */
function artigo(pergunta, lida) {
    const texto = el('p')
    if (lida) texto.append(el('span', { class: 'sr-only' }, ['Lida: ']))
    texto.append(document.createTextNode(pergunta.title))
    const acoes = lida
        ? [botao('delete', pergunta.id, 'trash', 'Excluir')]
        : [botao('check', pergunta.id, 'check', 'Marcar como lida'), botao('delete', pergunta.id, 'trash', 'Excluir')]
    return el('article', { class: lida ? 'question-wrapper read' : 'question-wrapper', 'data-id': pergunta.id }, [
        el('div', { class: 'question-content' }, [
            el('div', { class: 'user', 'aria-hidden': 'true' }, [el('img', { src: '/images/user.svg', alt: '' })]),
            el('div', { class: 'question' }, [texto])
        ]),
        el('div', { class: 'actions' }, acoes)
    ])
}

/* Estado vazio igual ao da parte no-question.ejs. */
function vazio() {
    return el('div', { class: 'no-questions', role: 'status' }, [
        el('img', { src: '/images/noquestions.svg', alt: '', 'aria-hidden': 'true' }),
        el('p', {}, ['Nenhuma pergunta por aqui...']),
        el('p', {}, ['Faça sua primeira pergunta e envie o ', el('br'), 'código dessa sala para outras pessoas!'])
    ])
}

/* Texto do aviso: quantas perguntas novas chegaram. */
export function textoDoAviso(novas) {
    if (novas === 0) return 'Lista de perguntas atualizada.'
    return novas === 1 ? '1 pergunta nova.' : `${novas} perguntas novas.`
}

/* Liga a atualização automática; devolve a função que consulta uma vez (útil em teste). */
export default function iniciarAtualizacao({ roomId, lista, aviso, dialogoAberto }) {
    let atual = assinaturaDaPagina(lista)

    async function consultar() {
        if (document.hidden || dialogoAberto()) return
        let dados
        try {
            const resposta = await fetch(`/room/${roomId}/questions.json`, { headers: { Accept: 'application/json' } })
            if (!resposta.ok) return
            dados = await resposta.json()
        } catch (erro) {
            return // Sem rede: tenta de novo na próxima volta, sem avisar a cada 15 s.
        }
        const nova = assinatura(dados.unread, dados.read)
        if (nova === atual || dialogoAberto()) return

        const conhecidas = new Set(atual.split(',').filter(Boolean).map((item) => item.slice(1)))
        const novas = [...dados.unread, ...dados.read].filter((q) => !conhecidas.has(String(q.id))).length

        // Guarda o foco para devolvê-lo ao mesmo botão depois da troca.
        const focado = lista.contains(document.activeElement) ? document.activeElement : null
        const seletorFoco = focado && focado.dataset.id ? `.${focado.classList[1]}[data-id="${focado.dataset.id}"]` : null

        const filhos = [
            ...dados.unread.map((q) => artigo(q, false)),
            ...dados.read.map((q) => artigo(q, true))
        ]
        lista.replaceChildren(...(filhos.length ? filhos : [vazio()]))
        atual = nova
        aviso.textContent = textoDoAviso(novas)

        if (seletorFoco) {
            const alvo = lista.querySelector(seletorFoco)
            if (alvo) alvo.focus()
        }
    }

    setInterval(consultar, INTERVALO_MS)
    return consultar
}
/* fim de questions-live.js */

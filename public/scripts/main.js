/*
 * main.js · ações da sala: marcar como lida, excluir (com senha no diálogo), copiar o código
 * e atualizar a lista sem recarregar.
 */
import Modal from './modal.js'
import iniciarAtualizacao from './questions-live.js'

const modal = Modal()
const modalTitle = document.querySelector('#modal-title')
const modalDescription = document.querySelector('#modal-description')
const modalButton = document.querySelector('.modal .confirm')
const form = document.querySelector('.modal form')
const roomButton = document.querySelector('#room-id')
const copyStatus = document.querySelector('#copy-status')
const roomId = roomButton.dataset.id
const questionList = document.querySelector('#questions .questions')

/* Prepara o diálogo para a ação escolhida no botão clicado. */
function handleClick(button, check) {
    const text = check ? 'Marcar como lida' : 'Excluir'
    const slug = check ? 'check' : 'delete'
    form.setAttribute('action', `/question/${roomId}/${button.dataset.id}/${slug}`)
    modalTitle.textContent = `${text} esta pergunta`
    modalDescription.textContent = `Tem certeza que deseja ${text.toLowerCase()} esta pergunta?`
    modalButton.textContent = `Sim, ${text.toLowerCase()}`
    modalButton.classList.toggle('red', !check)
    modal.open(button)
}

/* Copia o código da sala e anuncia o resultado para leitores de tela. */
async function copyRoomCode() {
    try {
        await navigator.clipboard.writeText(roomId)
        copyStatus.textContent = `Código ${roomId} copiado.`
        roomButton.classList.add('copied')
        setTimeout(() => roomButton.classList.remove('copied'), 1500)
    } catch (error) {
        copyStatus.textContent = `Não foi possível copiar. O código é ${roomId}.`
    }
}

/* Um ouvinte só na lista: vale também para as perguntas que chegam pela atualização. */
questionList.addEventListener('click', (event) => {
    const button = event.target.closest('.actions .action')
    if (!button) return
    handleClick(button, button.classList.contains('check'))
})
roomButton.addEventListener('click', copyRoomCode)

iniciarAtualizacao({
    roomId,
    lista: questionList,
    aviso: document.querySelector('#questions-status'),
    dialogoAberto: () => !document.querySelector('.modal-wrapper').hidden
})
/* fim de main.js */

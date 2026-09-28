/*
 * main.js · ações da sala: marcar como lida, excluir (com senha no diálogo) e copiar o código.
 */
import Modal from './modal.js'

const modal = Modal()
const modalTitle = document.querySelector('#modal-title')
const modalDescription = document.querySelector('#modal-description')
const modalButton = document.querySelector('.modal .confirm')
const form = document.querySelector('.modal form')
const roomButton = document.querySelector('#room-id')
const copyStatus = document.querySelector('#copy-status')
const roomId = roomButton.dataset.id

/* Prepara o diálogo para a ação escolhida; usa currentTarget para funcionar ao clicar no ícone. */
function handleClick(event, check) {
    const button = event.currentTarget
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

document.querySelectorAll('.actions .check').forEach((button) => {
    button.addEventListener('click', (event) => handleClick(event, true))
})
document.querySelectorAll('.actions .delete').forEach((button) => {
    button.addEventListener('click', (event) => handleClick(event, false))
})
roomButton.addEventListener('click', copyRoomCode)
/* fim de main.js */

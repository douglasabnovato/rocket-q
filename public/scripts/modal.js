/*
 * modal.js · diálogo acessível: foco no campo de senha, Esc fecha,
 * Tab fica preso no diálogo e o foco volta ao botão que abriu.
 */
export default function Modal() {
    const wrapper = document.querySelector('.modal-wrapper')
    const dialog = wrapper.querySelector('.modal')
    const cancelButton = wrapper.querySelector('.cancel')
    let lastTrigger = null

    /* Mantém o foco dentro do diálogo e fecha com Esc. */
    function onKeydown(event) {
        if (event.key === 'Escape') return close()
        if (event.key !== 'Tab') return
        const focusable = dialog.querySelectorAll('input, button')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    }

    /* Abre o diálogo e leva o foco ao campo de senha. */
    function open(trigger) {
        lastTrigger = trigger
        wrapper.hidden = false
        wrapper.classList.add('active')
        document.addEventListener('keydown', onKeydown)
        dialog.querySelector('input').focus()
    }

    /* Fecha o diálogo, limpa a senha e devolve o foco. */
    function close() {
        wrapper.classList.remove('active')
        wrapper.hidden = true
        dialog.querySelector('input').value = ''
        document.removeEventListener('keydown', onKeydown)
        if (lastTrigger) lastTrigger.focus()
    }

    cancelButton.addEventListener('click', close)
    wrapper.addEventListener('click', (event) => {
        if (event.target === wrapper) close()
    })

    return { open, close }
}
/* fim de modal.js */

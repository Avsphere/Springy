import orchestrator from './orchestrator'
import emitter from './emitter.js'

const logic = {}

//any interaction with orchestrator is done by event emitting. This is because nearly all components require knowledge of the animating.


window.addEventListener('keyup', (ev) => {
    const isSpaceKey = ev.keyCode == 32;
    
    if (isSpaceKey) {
        ev.preventDefault();
        emitter.emit('orchestrator/toggleAnimate', { calledBy: 'view.js/keyup' })
    }

    if (ev.key === 'r' || ev.key === 'R') {
        emitter.emit('orchestrator/reset', { calledBy : 'view.js/keyup'})
    }
})

window.addEventListener('resize', () => {
    emitter.emit('orchestrator/resize', { calledBy: 'view.js/resize' })
})

logic.init = () => {
    orchestrator.init();
}

export { logic as default }
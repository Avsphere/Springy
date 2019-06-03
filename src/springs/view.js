import orchestrator from './orchestrator'

const logic = {}

const handlers = {}


window.addEventListener('keyup', (ev) => {
    const isSpaceKey = ev.keyCode == 32;
    
    if (isSpaceKey) {
        ev.preventDefault();
        const isAnimating = orchestrator.toggleAnimation() //this only toggles if specs are met.
    }

    if (ev.key === 'r' || ev.key === 'R') {
        orchestrator.reset();
    }
})

window.addEventListener('resize', () => {
    orchestrator.resize();
})

logic.init = () => {
    orchestrator.init();
}

export { logic as default }
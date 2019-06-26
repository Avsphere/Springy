import orchestrator from './orchestrator'
import emitter from './emitter.js'
import $ from 'jquery';

const state = {
    debug : true
}
const logic = {}

//any interaction with orchestrator is done by event emitting. This is because nearly all components require knowledge of the animating.


window.addEventListener('keyup', (ev) => {
    const isSpaceKey = ev.keyCode == 32;
    ev.preventDefault();
    
    //don't want to toggle when typing
    if (isSpaceKey && ev.target.nodeName !== 'INPUT') {
        emitter.emit('orchestrator/toggleAnimate', { calledBy: 'view.js/keyup' })
    }

    if (ev.key === 'r' || ev.key === 'R') {
        emitter.emit('orchestrator/frameReset', { calledBy : 'view.js/keyup'})
    }


})

window.addEventListener('resize', () => {
    emitter.emit('orchestrator/resize', { calledBy: 'view.js/resize' })
})

window.addEventListener('contextmenu', (ev) => {
    if ( state.debug ) {
        console.log('supressing context menu')
    }
    ev.preventDefault();
})

$('#toggleSpringCanvas').on('click', (ev) => {
    if (document.getElementById('toggleSpringCanvas').checked ) {
        emitter.emit('orchestrator/toggleCanvas', {
            calledBy: 'view.js/toggleSpringCanvas', 
            springCanvas: true, 
            plotCanvas : false, 
        })
    }
})

$('#togglePlotCanvas').on('click', (ev) => {
    if (document.getElementById('togglePlotCanvas').checked) {
        emitter.emit('orchestrator/toggleCanvas', {
            calledBy: 'view.js/togglePlotCanvas',
            springCanvas: false,
            plotCanvas: true,
        })
    }
})

$('#toggleAnimation').on('click', (ev) => {
    emitter.emit('orchestrator/toggleAnimate', { calledBy: 'view.js/keyup' })
})

$('#resetSystem').on('click', (ev) => {
    emitter.emit('orchestrator/reset', { calledBy: 'view.js/keyup' })
})

logic.init = () => {
    orchestrator.init();
}

export { logic as default }
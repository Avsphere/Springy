import system from './system/system'
import springCanvas from './springCanvas/springCanvas'
import plotCanvas from './plotCanvas/plotCanvas'
import emitter from './emitter.js'
import defaults from './defaults'
const state = {
    isAnimating : false,
    debugging : true
}

const logic = {}

const getDrawableComponents = () => {
    return [ springCanvas ]
}



const animate = () => {
    system.step(); //increments frame by 1
    getDrawableComponents().forEach( d => {
        d.clear(); 
        d.draw();
    })
    state.animationFrame = window.requestAnimationFrame(animate)
}

const stopAnimating = () => {
    state.isAnimating = false
    window.cancelAnimationFrame(state.animationFrame);
}

const toggleAnimate = () => {
    state.isAnimating = !state.isAnimating;
    if (state.isAnimating) {
        animate();
    } else {
        stopAnimating();
    }
}

const redraw = () => {
    if (state.isAnimating) {
        console.warn('orchestrator redraw requested')
        stopAnimating();
    }
    getDrawableComponents().forEach(d => {
        d.clear();
        d.draw();
    })
}
const resize = () => {
    if (state.isAnimating) {
        console.warn('orchestrator resize requested while animating')
        stopAnimating();
    }
    getDrawableComponents().forEach(c => c.resize())
}

const reset = () => {
    if (state.isAnimating) {
        stopAnimating();
    }
    //clears the drawables, resets the system
    getDrawableComponents().forEach(d => {
        d.reset();
    })
    system.reset();
}

emitter.on('orchestrator/toggleAnimate', (d) => {
    if ( state.debugging ) { console.log('%c orchestrator toggleAnimate event called by ', 'color:green', d.calledBy )}
    toggleAnimate()
})

emitter.on('orchestrator/stopAnimation', (d) => {
    if (state.debugging) { console.log('%c orchestrator stopAnimation event called by ', 'color:green', d.calledBy) }
    if (state.isAnimating) {
        stopAnimating();
    }
})

emitter.on('orchestrator/startAnimation', (d) => {
    if (state.debugging) { console.log('%c orchestrator startAnimation event called by ', 'color:green', d.calledBy) }

    if (!state.isAnimating) {
        animate();
    }
})

emitter.on('orchestrator/reset', (d) => {
    if (state.debugging) { console.log('%c orchestrator reset event called by ', 'color:green', d.calledBy) }
    reset()
})

//few cases justify this emit
emitter.on('orchestrator/redraw', (d) => {
    if (state.debugging) { console.log('%c orchestrator redraw event called by ', 'color:green', d.calledBy) }
    redraw();
})

emitter.on('orchestrator/resize', (d) => {
    if (state.debugging) { console.log('%c orchestrator resize event called by ', 'color:green', d.calledBy) }
    resize()
})


logic.init = () => {
    springCanvas.init();
    plotCanvas.init();
    defaults.load('circleSystem')
    animate();
}


export { logic as default }

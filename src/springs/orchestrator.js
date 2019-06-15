import system from './system/system'
import springCanvas from './springCanvas/springCanvas'
import plotCanvas from './plotCanvas/plotCanvas'
import monitorPanel from './panels/monitor'
import emitter from './emitter.js'
import defaults from './defaults'
const state = {
    isAnimating : false,
    debugging : true,
    debug : { 
        redraw : false //bc some events are annoying  
    }
}

const logic = {}

const getDrawableComponents = () => {
    return [ springCanvas ]
}

const getPanels = () => {
    return [monitorPanel]
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
    redraw()
}

const toggleAnimate = () => {
    state.isAnimating = !state.isAnimating;
    if (state.isAnimating) {
        getDrawableComponents().forEach(d => {
            d.setOverlays(true);
        })
        animate();
    } else {
        getDrawableComponents().forEach(d => {
            d.setOverlays(false);
        })
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
    //ORDER MATTERS, panels need to subscribe to other components
    if (state.isAnimating) {
        stopAnimating();
    }
    //clears the drawables, resets the system
    getDrawableComponents().forEach(d => {
        d.reset();
    })

    system.reset();

    getPanels().forEach(p => {
        p.reset();
    })

    redraw();
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
    if (state.debugging && state.debug.redraw ) { console.log('%c orchestrator redraw event called by ', 'color:green', d.calledBy) }
    redraw();
})

emitter.on('orchestrator/resize', (d) => {
    if (state.debugging) { console.log('%c orchestrator resize event called by ', 'color:green', d.calledBy) }
    resize()
    redraw()
})


logic.init = () => {
    springCanvas.init();
    plotCanvas.init();
    monitorPanel.init();
    // defaults.load('circleSystem')
    // toggleAnimate();
}


export { logic as default }

import system from './system/system'
import springCanvas from './springCanvas/springCanvas'
import plotCanvas from './plotCanvas/plotCanvas'
import monitorPanel from './panels/monitor'
import controlPanel from './panels/control'
import defaultPanel from './panels/defaults'
import emitter from './emitter.js'
import defaultSystems from './defaultSystems'
const state = {
    isAnimating : false,
    debugging : true,
    debug : { 
        redraw : false //bc some events are annoying  
    },
    focusedCanvas: springCanvas //the canvas being drawn, defaults to spring canvas
}

const logic = {}

const getDrawableComponents = () => {
    return [springCanvas, plotCanvas ]
}

const getPanels = () => {
    return [monitorPanel, controlPanel]
}

const resetPanels = () => {
    getPanels().forEach( p => p.reset() )
}

const animate = () => {
    system.step(); //increments frame by 1
    getDrawableComponents().forEach(d => {
        d.clear();
        d.draw(state.isAnimating)
    })
    // state.focusedCanvas.clear()
    // state.focusedCanvas.draw(state.isAnimating);
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
        d.draw(state.isAnimating);
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

emitter.on('orchestrator/toggleCanvas', (msg) => {
    if (state.debugging) { console.log('%c orchestrator toggleCanvas event called by ', 'color:green', msg.calledBy) }
    if (msg.springCanvas === true ) {
        plotCanvas.hide()
        springCanvas.show();
        state.focusedCanvas = springCanvas
    } else if (msg.plotCanvas === true ) {
        plotCanvas.show()
        springCanvas.hide();
        state.focusedCanvas = plotCanvas
    }

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
    //should also rebuild panels
    resetPanels();
})

emitter.on('orchestrator/frameReset', (d) => {
    if (state.debugging) { console.log('%c orchestrator frameReset event called by ', 'color:green', d.calledBy) }
    system.update({ frameIndex : 0 })
})


emitter.on('orchestrator/resetPanels', (d) => {
    if (state.debugging) { console.log('%c orchestrator reset event called by ', 'color:green', d.calledBy) }
    resetPanels();
})

emitter.on('orchestrator/redraw', (d) => {
    if (state.debugging && state.debug.redraw ) { console.log('%c orchestrator redraw event called by ', 'color:green', d.calledBy) }
    if (d.condition === 'isNotAnimating' && state.isAnimating === false) {
        redraw();
    } else if ( !d.condition ) {
        redraw();
    }
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
    controlPanel.init();
    defaultPanel.init();
    setTimeout( () => {
        defaultSystems.load( defaultSystems.getSystems()[0] )
    }, 1000) //load it after page has smoothed
}


export { logic as default }

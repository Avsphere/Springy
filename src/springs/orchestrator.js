import system from './system/system'
import springCanvas from './springCanvas/springCanvas'
import plotCanvas from './plotCanvas/plotCanvas'

const state = {
    isAnimating : false,

}

const logic = {}

const getDrawableComponents = () => {
    return [ springCanvas, plotCanvas ]
}



const animate = () => {
    system.step(); //increments frame by 1
    getDrawableComponents().forEach( d => d.clear().draw() )
    state.animationFrame = window.requestAnimationFrame(animate)
}

const stopAnimating = () => window.cancelAnimationFrame( state.animationFrame );



logic.toggleAnimate = () => {
    state.isAnimating = state.isAnimating;
    if ( state.isAnimating ) {
        animate();
    } else {
        stopAnimating();
    }
}

logic.redraw = () => {
    springCanvas.draw();
}

logic.resize = () => {
    getDrawableComponents().forEach( c => c.resize() )
}

logic.init = () => {
    springCanvas.init();
    plotCanvas.init();
}


export { logic as default }

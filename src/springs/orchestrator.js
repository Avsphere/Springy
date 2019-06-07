import system from './system/system'
import springCanvas from './springCanvas/springCanvas'
import plotCanvas from './plotCanvas/plotCanvas'

const state = {
    isAnimating : false,

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



logic.toggleAnimate = () => {
    state.isAnimating = !state.isAnimating;
    if ( state.isAnimating ) {
        animate();
    } else {
        stopAnimating();
    }

    // setTimeout( () => {
    //     stopAnimating();
    // }, 1000)
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

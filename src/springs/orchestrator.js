import system from './system/system'
import springCanvas from './springCanvas/springCanvas'
import plotCanvas from './plotCanvas/plotCanvas'

const state = {

}
const logic = {}

const getActiveComponents = () => {
    return [ springCanvas ]
}



logic.toggleAnimate = () => {

}

logic.redraw = () => {
    springCanvas.draw();
}

logic.resize = () => {
    getActiveComponents().forEach( c => c.resize() )
}

logic.init = () => {
    springCanvas.init();
    plotCanvas.init();
}


export { logic as default }

import handlers from './handlers'
import listeners from './listeners'

const State = () => Object.assign({
    canvas: {
        initialWidth: 0, //set in main
        initialHeight: 0, //set in main
        id: 'plotCanvas' //domId
    },
    activeHandlers: { //specifically temp handlers
        drag: false //false or the handler
    },
    transforms: {}, 
    controlFlags: {
        showPlot: true,
        cursorStats: false,
        showWeightIds: false,
        showSpringIds: false,
        showWeightDetails: true,
        showSpringDetails: true,
        showGrid: false,
        lockY: true
    }
})

const logic = {}
let state; //allows for an easier reset.

logic.getMousePosition = (ev) => ({
    x: ev.clientX - canvas.getBoundingClientRect().left,
    y: ev.clientY - canvas.getBoundingClientRect().top,
})

logic.clearCanvas = ({ x, y, x1, y1}) => {
    ctx.clearRect(x || 0, y || 0, x1 || canvas.width, y1 || canvas.height)
} 

const setCanvasDimensions = () => {
    const canvasContainerWidth = $('#canvasContainer').innerWidth();
    state.canvas.width = canvasContainerWidth * .95;
    state.canvas.height = window.innerHeight * .95

}
logic.resize = () => {
    setCanvasDimensions();
}
logic.init = () => {
    state = State();
}

export { logic as default }
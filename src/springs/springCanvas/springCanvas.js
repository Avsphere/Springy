import handlers from './handlers'
import listeners from './listeners'
import grid from './grid'

const State = () => Object.assign({
    canvasSettings: {
        initialWidth: 0, //set in main
        initialHeight: 0, //set in main
        id: 'springCanvas', //domId
    },
    canvas: document.getElementById('springCanvas'),
    ctx: document.getElementById('springCanvas').getContext('2d'),
    activeHandlers: { //specifically temp handlers
        drag: false //false or the handler
    },
    transforms: {},
    controlFlags: {
        showPlot: true,
        cursorStats: false,
        showMassIds: false,
        showSpringIds: false,
        showMassDetails: true,
        showSpringDetails: true,
        showGrid: false,
        lockY: true
    },
    debug : true,
    debugOptions : {
        logCursor : false
    }
})

const logic = {}
let state; //allows for an easier reset.

const setCanvasDimensions = () => {
    const canvasContainerWidth = $('#canvasContainer').innerWidth();
    state.canvas.width = canvasContainerWidth * .95;
    state.canvas.height = window.innerHeight * .95

}

const getMousePosition = (ev) => ({
    x: ev.clientX - state.canvas.getBoundingClientRect().left,
    y: ev.clientY - state.canvas.getBoundingClientRect().top,
})

const updateTransforms = () => {
    state.transforms.shift = state.canvas.width - System.getCenter();
}

logic.clearCanvas = ({ x, y, x1, y1 }) => {
    ctx.clearRect(x || 0, y || 0, x1 || state.canvas.width, y1 || state.canvas.height)
}

logic.resize = () => {
    setCanvasDimensions();
}

logic.debug = () => {
    if ( state.debugOptions.logCursor ) {
        state.canvas.addEventListener('mousemove', (ev) => {
            console.log('springCanvasDebug: ', getMousePosition(ev));
        })
    }
}

/* draws the grid / masses*/
logic.draw = () => {
    updateTransforms();
    System.draw({ transforms : state.transforms })
}


logic.init = () => {
    state = State();
    setCanvasDimensions();
    if ( state.debug ) { logic.debug(); }
}

export { logic as default }
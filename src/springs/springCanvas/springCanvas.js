import handlers from './handlers'
import listeners from './listeners'
import system from '../system/system'
import grid from './grid'
import drawWeight from './drawWeight'
import drawSpring from './drawSpring'

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
    transforms : {
        shift : {
            x : 0,
            y : 0
        },
        scale : 0
    }, //maintains shift and scale
    displayFlags : {
        showPlot: true,
        cursorStats: false,
        showWeightIds: false,
        showSpringIds: false,
        showWeightDetails: true,
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
    state.transforms.shift.x = state.canvas.width - system.getCenter();
    state.transforms.shift.x = state.canvas.height - system.getCenter();
}

logic.clear = (x=0, y=0, x1=state.canvas.width, y1=state.canvas.width) => {
    state.ctx.clearRect(x, y , x1, y1)
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

/* draws the grid / weights*/
logic.draw = () => {
    const { springs, weights } = system.getObjs()
    // const systemMetadata = system.getMetadata()
    updateTransforms();
    weights.forEach(weight => drawWeight(
        { 
            state, 
            weight,
            transforms : state.transforms,
            // systemMetadata: systemMetadata
        }) 
    )
    springs.forEach(spring => drawSpring(
        {
            state,
            spring,
            transforms: state.transforms,
            // systemMetadata: systemMetadata
        })
    )
}


logic.init = () => {
    state = State();
    setCanvasDimensions();
    if ( state.debug ) { logic.debug(); }
}

export { logic as default }
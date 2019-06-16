import initListenAndHandle from './listenAndHandle'
import system from '../system/system'
import grid from './grid'
import { draw as drawWeight } from './drawWeight'
import { draw as drawSpring } from './drawSpring'
import { draw as drawSystemCenter } from './drawSystemCenter'
import { draw as drawMousePosition } from './drawMousePosition'

const State = () => Object.assign({
    canvasSettings: {
        initialWidth: 0, //set in main
        initialHeight: 0, //set in main
        id: 'springCanvas', //domId
    },
    canvas: document.getElementById('springCanvas'),
    ctx: document.getElementById('springCanvas').getContext('2d'),
    debug : true,
    debugOptions : {
        logCursor : false
    },
    lastMousePosition: {
        exact: { x: 0, y: 0 },
        relative: { x: 0, y: 0 }
    },
    canvasScalarDimensions : {
        width : .95,
        height : .88,
    },
    displayFlags: {
        cursorPosition: true,
        showWeightIds: false,
        showSpringIds: false,
        showWeightDetails: true,
        showSpringDetails: true,
        showGrid: false,
        lockY: true,
        showSystemCenter: true,
    }, 
    drawOverlays: false, //when this is false things like mouse cursor Position will not be drawn 

})

const logic = {}
let state; //allows for an easier reset, set in init.

const setCanvasDimensions = () => {
    const canvasContainer = $('#canvasContainer')
    state.canvas.width = canvasContainer.innerWidth() * state.canvasScalarDimensions.width;
    // state.canvas.height = canvasContainer.innerHeight() * .95
    state.canvas.height = window.innerHeight * state.canvasScalarDimensions.height

}

logic.clear = (x=0, y=0, x1=state.canvas.width, y1=state.canvas.height) => {
    state.ctx.clearRect(x, y , x1, y1)
}

logic.resize = () => {
    setCanvasDimensions();
}


/* draws the grid / weights*/
logic.draw = () => {
    const { springs, weights } = system.getObjs()
    const sysCenter = system.getCenter()
    
    if ( state.displayFlags.showGrid === true ) {
        grid.draw({ springCanvasState: state, systemCenter: sysCenter })
    }
    if ( state.displayFlags.showSystemCenter === true ) {
        drawSystemCenter({ springCanvasState: state, systemCenter: sysCenter })
    }
    if ( state.displayFlags.cursorPosition && state.drawOverlays ) {
        const inVisibleX = state.lastMousePosition.exact.x > 10 && state.lastMousePosition.exact.x < state.canvas.width - 10
        const inVisibleY = state.lastMousePosition.exact.y > 10 && state.lastMousePosition.exact.y < state.canvas.height - 10
        //ha... not that is is "invisible"
        if (inVisibleX && inVisibleY ) {
            drawMousePosition({ springCanvasState : state, systemCenter : sysCenter })
        }
    }
    weights.forEach(weight => drawWeight(
        { 
            state, 
            weight,
            systemCenter: system.getCenter()
        }) 
    )
    springs.forEach(spring => drawSpring(
        {
            state,
            spring,
            systemCenter: system.getCenter()
        })
    )
}

logic.setDisplayFlag = (flag, value) => {
    if ( state.displayFlags.hasOwnProperty(flag) ) {
        state.displayFlags[flag] = value;
    } else {
        throw new Error(`Unknown display flag, ${flag}, ${value}`)
    }
}

logic.getDisplayFlags = () => state.displayFlags

logic.setOverlays = (b=false) => state.drawOverlays = b

logic.init = () => {
    state = State();
    setCanvasDimensions();
    initListenAndHandle(state);
    state.canvas.style.cursor = 'crosshair'
}

logic.getState = () => state
logic.reset = () => {
    state = State();
    setCanvasDimensions();
}; 

export { logic as default }
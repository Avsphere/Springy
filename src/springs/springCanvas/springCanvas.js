import initListenAndHandle from './listenAndHandle'
import system from '../system/system'
import grid from './grid'
import { draw as drawWeight } from './drawWeight'
import { draw as drawSpring } from './drawSpring'
import { draw as drawShift } from './drawShift'
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
        showWeightIds: true,
        showSpringIds: false,
        showWeightDetails: true,
        showSpringDetails: false,
        showGrid: false,
        showSystemCenter : true,
        useCamera : false
    },
    transforms : {
        shift : { x : 0, y : 0 },
        scale : 0
    },
    camera : {
        screenBuffer : 50, //50 pixel away from edge of screen
        offTheScreen : true, //basic shift things over to keep them on screen approach
        // smoothing : 
    },
    drawOverlays: false, //when this is false things like mouse cursor Position will not be drawn 
    inFocus : true, //this is set to false when the plotter canvas is open
    componentName : 'springCanvas'
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


const updateShift = () => {
    try {
        if (state.camera.offTheScreen === true) {
            //furthers left, right, ...`
            const { minX, maxX, maxY, minY } = system.getBoundaryNodes();
            const { shift } = state.transforms //shift.x refers to how far everything is moved in x direction
            const isOffRight = maxX.position.x + state.camera.screenBuffer > state.canvas.width
            const isOffLeft = minX.position.x - state.camera.screenBuffer < 0
            if (isOffRight) {
                shift.x = state.canvas.width - (maxX.position.x + state.camera.screenBuffer);
            } else if (isOffLeft) {
                shift.x = -1*minX.position.x + state.camera.screenBuffer
            }

            const isOffTop = minY.position.y - state.camera.screenBuffer < 0;
            if ( isOffTop ) {
                shift.y = -1 * minY.position.y + state.camera.screenBuffer
            }
        }
    } catch (err) {
        if (err.message !== 'boundary nodes needs a graph size of > 1' ) {
            console.error(err);
        }
    }

}
/* draws the grid / weights*/

logic.draw = (isAnimating) => {
    const { springs, weights } = system.getObjs()
    const sysCenter = system.getCenter()

    if (state.displayFlags.useCamera && isAnimating ) {
        updateShift();
    }
    
    if ( state.displayFlags.showGrid === true ) {
        grid.draw({ springCanvasState: state, systemCenter: sysCenter })
    }
    if ( state.displayFlags.showSystemCenter === true ) {
        drawSystemCenter({ springCanvasState: state, systemCenter: sysCenter })
    }
    if ( state.displayFlags.cursorPosition ) {
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
            systemCenter: sysCenter
        }) 
    )
    springs.forEach(spring => drawSpring(
        {
            state,
            spring,
            systemCenter: sysCenter
        })
    )
}


logic.getShift = () => state.shift;



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

logic.show = () => {
    state.inFocus = true;
    $(state.canvas).css('display', 'inline')
}

logic.hide = () => {
    state.inFocus = false;
    $(state.canvas).css('display', 'none')
}


window.setShift = (x=0,y=0) => {
    state.transforms.shift.x = x
    state.transforms.shift.y = y
}


logic.getState = () => state
logic.getDimensions = () => ({
    width : state.canvas.width,
    height : state.canvas.height
})
logic.reset = () => {
    state = State();
    setCanvasDimensions();
}; 

export { logic as default }
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
        // lockY: true,
        showShift: false,
        showSystemCenter : true,
    },
    transforms : {
        shift : { x : 0, y : 0 },
        scale : 0
    },
    camera : {
        useCamera : true,
        offTheScreen : true, //basic shift things over to keep them on screen approach
        // smoothing : 
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


const updateShift = () => {
    if (state.camera.offTheScreen === true) {
        //furthers left, right, ...
        const { minX, maxX, maxY, minY } = system.getBoundaryNodes();
        const { shift } = state.transforms
        //adjusts for shift
        const relativePos = {
            minX: minX.position.x + shift.x,
            maxX: maxX.position.x + shift.x,
            minY : minY.position.y + shift.y,
            maxY : maxY.position.y + shift.y
        }
        const offScreen = {
            // left: relativePos.minX.position.x < 0 ? relativePos.minX .position.x: 0, //i.e if minX is -100 then it is off the screen by 100px
            right: relativePos.maxX > state.canvas.width ? relativePos.maxX - state.canvas.width : 0, //ie if the weight is x = 1000 and width = 500 then it is off the screen by 500 
            // up: relativePos.minY.position < 0 ? relativePos.minY.position : 0,
            // down: relativePos.maxY.position > state.canvas.height ? relativePos.maxY.position : 0
        }
        if (offScreen.right > 0) {
            //meaning that the farthest weight is some pixels off the screen
            //then we need to shift everything left such that it is on the screen
            state.transforms.shift.x = -1 * offScreen.right;
            console.log('uh oh somethings off the right side by ', offScreen.right)
        }
    }
}
/* draws the grid / weights*/
logic.draw = () => {
    const { springs, weights } = system.getObjs()
    const sysCenter = system.getCenter()
    if ( state.camera.useCamera ) {
        // updateShift();
    }
    
    if ( state.displayFlags.showGrid === true ) {
        grid.draw({ springCanvasState: state, systemCenter: sysCenter })
    }
    if ( state.displayFlags.showShift === true ) {
        drawShift({ springCanvasState: state })
    } else if ( state.displayFlags.showSystemCenter === true ) {
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

logic.getState = () => state
logic.reset = () => {
    state = State();
    setCanvasDimensions();
}; 

export { logic as default }
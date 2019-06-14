import initListenAndHandle from './listenAndHandle'
import system from '../system/system'
import grid from './grid'
import { draw as drawWeight } from './drawWeight'
import { draw as drawSpring } from './drawSpring'
import { draw as drawSystemCenter } from './drawSystemCenter'

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
    //everything is relative to systemCenter. if canvasCenter is 100 and sysCenter is 200 then shift is -100
    transforms : {
        shift : {
            x : 0,
            y : 0
        },
        scale : 0,
        systemCenter : { x : 0, y : 0 } 
    }, 
    displayFlags : {
        cursorStats: false,
        showWeightIds: false,
        showSpringIds: false,
        showWeightDetails: true,
        showSpringDetails: true,
        showGrid: false,
        lockY: true,
        showSystemCenter : true
    },
    debug : true,
    debugOptions : {
        logCursor : false
    }
})

const logic = {}
let state; //allows for an easier reset, set in init.

const setCanvasDimensions = () => {
    const canvasContainerWidth = $('#canvasContainer').innerWidth();
    state.canvas.width = canvasContainerWidth * .95;
    state.canvas.height = window.innerHeight * .95

}


const getMousePosition = (ev) => ({
    x: ev.clientX - state.canvas.getBoundingClientRect().left,
    y: ev.clientY - state.canvas.getBoundingClientRect().top
})

//This is only called here and in the listenAndHandle
const updateTransforms = () => {
    const sysCenter = system.getCenter() //note that getCenters if second invoke uses cached prev result
    state.transforms.systemCenter = sysCenter
    state.transforms.shift.x = state.canvas.width/2 - sysCenter.x; 
    state.transforms.shift.y = state.canvas.height/2 - sysCenter.y; 
    // console.log('shift x : ', state.transforms.shift.x )
}

logic.clear = (x=0, y=0, x1=state.canvas.width, y1=state.canvas.height) => {
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
    if ( state.displayFlags.showGrid === true ) {
        grid.draw({ springCanvasState: state, systemCenter: system.getCenter() })
    }
    if ( state.displayFlags.showSystemCenter === true ) {
        drawSystemCenter({ springCanvasState: state, systemCenter: system.getCenter() })
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

logic.getShift = () => {
    updateTransforms();
    return state.transforms.shift
}


logic.init = () => {
    state = State();
    setCanvasDimensions();
    initListenAndHandle(state);
    if ( state.debug ) { logic.debug(); }
}

logic.setDebug = (bool) => {
    state.debug = bool
}
logic.getState = () => state
logic.reset = () => logic.init(); //in this case I am aliasing because in the initializing loop it comes off as conceptually strange

export { logic as default }
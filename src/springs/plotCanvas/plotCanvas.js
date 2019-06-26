import system from '../system/system'
import emitter from '../emitter'
const State = () => Object.assign({
    componentName: 'springCanvas',
    canvasSettings: {
        initialWidth: 0, //set in main
        initialHeight: 0, //set in main
        id: 'plotCanvas', //domId
    },
    canvas: document.getElementById('plotCanvas'),
    ctx: document.getElementById('plotCanvas').getContext('2d'),
    debug: true,
    debugOptions: {
        logCursor: false
    },
    lastMousePosition: {
        exact: { x: 0, y: 0 },
        relative: { x: 0, y: 0 }
    },
    canvasScalarDimensions: {
        width: .95,
        height: .88,
    },
    velocityCache : {
        min : { x : Infinity, y : Infinity },
        max : { x : -Infinity, y : -Infinity }
    },
    velocityRange : { x : 0, y : 0 },
    drawOverlays : true,
    inFocus: false, //this is set to false when the plotter canvas is open
    step : 0
})

const logic = {}
let state; //allows for an easier reset, set in init.

const setCanvasDimensions = () => {
    const canvasContainer = $('#canvasContainer')
    state.canvas.width = canvasContainer.innerWidth() * state.canvasScalarDimensions.width;
    // state.canvas.height = canvasContainer.innerHeight() * .95
    state.canvas.height = window.innerHeight * state.canvasScalarDimensions.height

}

const updateVelocityCache = () => {
    const { weights } = system.getObjs()
    const plottableWeights = weights.filter(w => !w.fixed)
    plottableWeights.forEach( w => {
        if ( w.systemData.metadata.maxVelocity.x > state.velocityCache.max.x ) {
            state.velocityCache.max.x = w.systemData.metadata.maxVelocity.x 
        }
        if (w.systemData.metadata.maxVelocity.y > state.velocityCache.max.y) {
            state.velocityCache.max.y = w.systemData.metadata.maxVelocity.y
        }
        if (w.systemData.metadata.minVelocity.x < state.velocityCache.max.x) {
            state.velocityCache.min.x = w.systemData.metadata.minVelocity.x
        }
        if (w.systemData.metadata.minVelocity.y < state.velocityCache.max.y) {
            state.velocityCache.min.y = w.systemData.metadata.minVelocity.y
        }
    })
    state.velocityRange = {
        x: Math.abs(state.velocityCache.min.x - state.velocityCache.max.x),
        y: Math.abs(state.velocityCache.min.y - state.velocityCache.max.y),
    }
    state.vScalar = {
        x : (state.canvas.height/2 - 100) / state.velocityRange.x,
        y : (state.canvas.height/2 - 100) / state.velocityRange.y,
    }
}

const handleSystemChange = ({ changeType }) => {
    if (changeType === 'shift' || changeType === 'structure') {
        logic.clear('forceClear');
    }
    if ( changeType === 'solve' ) {
        updateVelocityCache();
    }
}


//I want to keep interface the same so I don't have to change orchestrator on per basis
//but this will only clear the rectangle if the step is greater than the width
logic.clear = (clearType) => {
    if (state.step > state.canvas.width || clearType === 'forceClear' ) {
        state.step = 0;
        state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    }
}

logic.resize = () => {
    setCanvasDimensions();
}

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

logic.draw = (isAnimating) => {
    if ( !isAnimating ) { return true; }
    const { weights } = system.getObjs()
    const plottableWeights = weights.filter(w => !w.fixed)
    const ctx = state.ctx
    const drawAt = {
        x: state.step % state.canvas.width,
    }
    const topHalf = state.canvas.height*.25
    const bottomHalf = state.canvas.height*.7
    plottableWeights.forEach( w => {
        // console.log('here')
        let radius = Math.log2(w.mass)*.5 + 1;
        // const radius = 2 * (w.mass / 10)
        ctx.lineWidth = 1;
        ctx.beginPath()
        ctx.arc(drawAt.x, topHalf - w.velocity.x*state.vScalar.x, radius, 0, Math.PI * 2, true)
        // ctx.arc(200, 200, 20, 0, Math.PI * 2, true)
        ctx.closePath();
        ctx.strokeStyle = updateOpacity(w.color, .35)
        ctx.stroke();

        //bottom half
        ctx.beginPath()
        ctx.arc(drawAt.x, bottomHalf - w.velocity.y * state.vScalar.y, radius, 0, Math.PI * 2, true)
        // ctx.arc(200, 200, 20, 0, Math.PI * 2, true)
        ctx.closePath();
        ctx.strokeStyle = updateOpacity(w.color, .35)
        ctx.stroke();

    })
    state.step++;

}



logic.init = () => {
    state = State();
    setCanvasDimensions();
    state.canvas.style.cursor = 'crosshair'
    const systemSubscription = 'plotterCanvas'
    system.subscribeToOnChange(systemSubscription)
    emitter.on(systemSubscription, handleSystemChange)
}

logic.show = () => {
    console.log('showing plot canvas')
    state.inFocus = true;
    $(state.canvas).css('display', 'inline')
}

logic.hide = () => {
    state.inFocus = false;
    $(state.canvas).css('display', 'none')
}


logic.setOverlays = (b = false) => state.drawOverlays = b


logic.getState = () => state
logic.getDimensions = () => ({
    width: state.canvas.width,
    height: state.canvas.height
})
logic.reset = () => {
    state = State();
    setCanvasDimensions();
};

export { logic as default }
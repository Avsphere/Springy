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
    step : -1, //-1 before init
    vScalar : { x : 0, y : 0 }, //scales the velocity to take up more of the available space
    //top half is 0 to .5 with the midline at .25
    topHalf: 0, //set in init / resize 
    bottomHalf: 0, //divides up the canvas into available space for plotting x / y velocity wrt t
})

const logic = {}
let state; //allows for an easier reset, set in init.

const setCanvasDimensions = () => {
    const canvasContainer = $('#canvasContainer')
    state.canvas.width = canvasContainer.innerWidth() * state.canvasScalarDimensions.width;
    state.canvas.height = window.innerHeight * state.canvasScalarDimensions.height

}

const handleMouseMove = (ev) => {
    if ( state.inFocus ) {
        const ctx = state.ctx
        const mousePosition = {
            x: ev.clientX - state.canvas.getBoundingClientRect().left,
            y: ev.clientY - state.canvas.getBoundingClientRect().top
        }
        const drawMouseAt = {
            x : state.canvas.width - 100,
            y: 50
        }
        const mouseBox = {
            x0 : state.canvas.width - 150,
            x1 : state.canvas.width,
            y0 : 0,
            y1 : 50 
        }
        state.ctx.clearRect(mouseBox.x0, mouseBox.y0, mouseBox.x1, mouseBox.y1)
        if ( mousePosition.y < state.topHalf*2 ) {
            const distAwayFromMidline = -(mousePosition.y - state.topHalf)
            const approxVx = distAwayFromMidline / state.vScalar.x
            ctx.font = `17px Arial`;
            ctx.fillStyle = "#000000";
            ctx.fillText(`~V.x = ${approxVx.toFixed(3)}`, mouseBox.x0, mouseBox.y1/2)
        } else {
            const distAwayFromMidline = -(mousePosition.y - state.bottomHalf)
            const approxVx = distAwayFromMidline / state.vScalar.y
            ctx.font = `17px Arial`;
            ctx.fillStyle = "#000000";
            ctx.fillText(`~V.y = ${approxVx.toFixed(3)}`, mouseBox.x0, mouseBox.y1 / 2)
        }
    }
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
    //scale velocity to take up maximum space, dividing by 3 will SOMETIMES allow outside
    state.vScalar = {
        x: (state.canvas.height * state.canvasScalarDimensions.height / 3 - 10) / state.velocityRange.x,
        y: (state.canvas.height * state.canvasScalarDimensions.height / 3 - 10) / state.velocityRange.y,
    }
}

const drawLabels = () => {
    const ctx = state.ctx
    ctx.lineWidth = 1;
    ctx.font = `20px Arial`;
    ctx.fillStyle = "#000000";
    ctx.fillText('X Velocity', state.canvas.width / 2 - state.canvas.width / 15, 20)
    ctx.fillText('Y Velocity', state.canvas.width / 2 - state.canvas.width / 15, state.canvas.height - 10)

    ctx.strokeStyle = 'rgba(0, 0, 0, .3)';
    ctx.beginPath();
    ctx.moveTo(0, state.topHalf);
    ctx.lineTo(state.canvas.width, state.topHalf);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, state.bottomHalf);
    ctx.lineTo(state.canvas.width, state.bottomHalf);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, .1)';
    ctx.beginPath();
    ctx.moveTo(0, state.topHalf*2);
    ctx.lineTo(state.canvas.width, state.topHalf*2);
    ctx.stroke();
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
        drawLabels();
    }

}

logic.resize = () => {
    setCanvasDimensions();
    state.topHalf = state.canvas.height * state.canvasScalarDimensions.height * .25 //0 to .5 with the midline at .25
    state.bottomHalf = state.canvas.height * state.canvasScalarDimensions.height * .75 //..5 to 1 with the midline at .75
}

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

logic.draw = (isAnimating) => {
    if ( !isAnimating ) { return true; }
    if ( state.step === -1 ) { logic.clear('forceClear') }
    const { weights } = system.getObjs()
    const ctx = state.ctx
    const drawAt = {
        x: state.step % state.canvas.width,
    }

    weights.forEach( w => {
        if ( w.fixed === false ) {
            // console.log('here')
            let radius = Math.log2(w.mass) * .5 + 1;
            // const radius = 2 * (w.mass / 10)
            ctx.lineWidth = 1;
            ctx.beginPath()
            ctx.arc(drawAt.x, state.topHalf - w.velocity.x * state.vScalar.x, radius, 0, Math.PI * 2, true)
            // ctx.arc(200, 200, 20, 0, Math.PI * 2, true)
            ctx.closePath();
            ctx.strokeStyle = updateOpacity(w.color, .35)
            ctx.stroke();

            //bottom half
            ctx.beginPath()
            ctx.arc(drawAt.x, state.bottomHalf - w.velocity.y * state.vScalar.y, radius, 0, Math.PI * 2, true)
            // ctx.arc(200, 200, 20, 0, Math.PI * 2, true)
            ctx.closePath();
            ctx.stroke();
        }


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
    state.topHalf = state.canvas.height * .25
    state.bottomHalf = state.canvas.height * .75

    state.canvas.addEventListener('mousemove', handleMouseMove);
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
import helpers from './helpers'
import sysGraph from './graph/graph' 
import solver from './solver' 
import emitter from '../emitter' 

const DEF_STEP = .08
const DEF_MAXT = 500

const State = () => ({
    currentFrame : 0,
    flags : {
        needsSolve : true
    },
    solverConfig : {
        stepSize: DEF_STEP,
        maxTime: DEF_MAXT,
        frameCount: DEF_MAXT / DEF_STEP
    },
    center : {
        frameCalculated : 0,
        position : { x : 0, y : 0 }
    },
    defaultValues : {
        weightMass : 10,
        springK : 1,
        velocity : { x : 0, y : 0 } //switch to injected config when time
    },
    snap : 5, //this means it rounds the x and y to the nearest 5 when spawning a weight
    debug : {
        solver : true
    }    
})

const roundToNearest = (n, roundingTo = 100) => {
    const r = n % roundingTo //if 286 then 86
    if (r > roundingTo / 2) {
        return roundingTo - r + n;
    } else {
        return n - r
    }
}

const logic = {}
let state = State();
//note that system state can be refreshed for a new system, but emitting / associates exist at singleton level
let onChangeSubscribers = [] //emits events to these paths, i.e. panels/monitor/sysChange


const emitChange = (changeType) => {
    onChangeSubscribers.forEach(eventName => emitter.emit(eventName, { calledBy : 'system/emitChange', changeType : changeType}))
}




const stateChanged = (changeType='state') => {
    const changeTypes = [ 'state', 'structure', 'shift' ]
    if ( !changeTypes.includes(changeType) ) {
        throw new Error('system unknown change type')
    }

    if (changeType === 'structure' || changeType === 'shift' ) {
        state.flags.needsSolve = true;
    }

    emitChange(changeType);
}

const checkForSolve = () => {
    if ( state.flags.needsSolve === true ) {
        solve();
    }
    if (state.currentFrame === state.solverConfig.frameCount -1 ) {
        // //I need to stop and replay animation so nothing changes in between
        // emitter.emit('orchestrator/stopAnimation', { calledBy: 'system/addingFrames' })
        // stateChanged() //in this case the change is self invoked...
        // solve(false)
    }
}


const solve = (clearFrames=true) => {
    state.flags.needsSolve = false;
    //the only reason clearFrames would be false is if we were adding more frames to the current animation
    if (clearFrames) {
        sysGraph.getWeights().forEach(w => w.systemData.frames = [] )
        state.currentFrame = 0;
    } else {
        //in this case I am continuing on their last frame so have to reset initials
        // sysGraph.getWeights().forEach(w => {
        //     const { position, velocity } = w.systemData.frames[w.systemData.frames.length-1]
        //     w.initialPosition = position
        //     w.initialVelocity = velocity
        // })

    }
    solver.solveSystem(state.solverConfig)
    if (state.debug.solver) {
        console.log('%c System solve completed!', 'color:green')
    }
    emitChange('solve') //onnly used in plot canvas to save time updating metadata
}


//frameSetter out of place only because currentFrame is supposed to be isolated here and don't want to slow down loop with a call to get it
//update and solve are only solve callers

logic.update = ({ frameIndex }) => {
    checkForSolve();
    if ( !frameIndex && frameIndex !== 0 ) {
        throw new Error('update requires frameIndex')
    }
    state.currentFrame = frameIndex
    sysGraph.getWeights().forEach(w => w.update(state.currentFrame))
    stateChanged();
    emitter.emit('orchestrator/redraw', { calledBy: 'system/update' })
    document.getElementById('frameSetter').value = state.currentFrame

}

//update and solve are only solve callers
logic.step = () => {
    checkForSolve();
    state.currentFrame++;
    sysGraph.getWeights().forEach( w => w.update(state.currentFrame) )
    stateChanged();

    document.getElementById('frameSetter').value = state.currentFrame
}

document.getElementById('frameSetter').addEventListener('keyup', (ev) => {
    const target = ev.target;
    const val = Number.parseFloat(target.value)
    if (!isNaN(val) && val >= 0 && val < state.solverConfig.frameCount) {
        logic.update({frameIndex : val})
    }
})


//position is true position, passer should account for relativity
logic.addWeight = ({ mass, position, springK, velocity }) => {

    if (!position.x && position.x !== 0 || !position.y && position.y !== 0 ) { throw new Error('system addWeight needs canvas x and y') }
    if (!mass) { mass = state.defaultValues.weightMass }
    if ( !springK ) { springK = state.defaultValues.springK }
    if ( !velocity ) { velocity = state.defaultValues.velocity }
    const { weightDist, weight } = sysGraph.findNearest(position)
    
    const snappedPosition = {
        x : roundToNearest(position.x, 5),
        y : roundToNearest(position.y, 5)
    }


    const newWeight = sysGraph.addWeight({ position: snappedPosition, mass, velocity })
    if ( weight !== false ) {
        //in this case I auto connect edges
        sysGraph.addEdge(weight, newWeight, springK)
    }
    stateChanged('structure')
    return newWeight;
}

//position is true position, passer should account for relativity
logic.removeWeight = ({ position }) => {
    if (!position.x && position.x !== 0 || !position.y && position.y !== 0) { throw new Error('system addWeight needs canvas x and y') }
    const { dist, weight } = sysGraph.findNearest(position)
    if (dist !== false || weight !== false) {
        sysGraph.removeWeight(weight)
    }
    stateChanged('structure')
}

logic.removeSpring = (springToRemove) => {
    sysGraph.removeSpring(springToRemove)
    stateChanged('structure')
}


//only settables and only location (outside of solver)... in need of a refactor
logic.set = ({ weight, x, y, vx, vy, mass, fixed, spring, k }) => {
    if ( weight ) {
        if (x || x === 0) {
            weight.position.x = x
            weight.initialPosition.x = x
        }
        if (y || y === 0) {
            weight.position.y = y
            weight.initialPosition.y = y
        }
        if (vx || vx === 0) {
            weight.velocity.x = vx
            weight.initialVelocity.x = vx
        }
        if (vy || vy === 0) {
            weight.velocity.y = vy
            weight.initialVelocity.y = vy
        }
        if (mass || mass === 0) {
            weight.setMass(mass) //because this also changes the radius
        }
        if (fixed === true || fixed === false) {
            weight.setFixed(fixed)
        }
    }

    if ( spring ) {
        if ( k || k === 0 ) {
            spring.k = k;
        }
    }

    stateChanged('shift')
}



logic.reset = () => {
    state = State();
    sysGraph.reset();
    stateChanged('structure')
}

logic.findNearest = ({ mousePosition }) => sysGraph.findNearest(mousePosition)


logic.subscribeToOnChange = (eventName) => {
    if ( !onChangeSubscribers.includes(eventName) ) {
        onChangeSubscribers.push(eventName)
    } else {
        console.warn('onchange subscribe dupe subscribe', eventName, onChangeSubscribers)
    }
}



logic.getObjs = () => ({
    weights : sysGraph.getState().weights,
    springs : sysGraph.getState().springs
})

logic.getCenter = (forceCalc) => {
    if (!forceCalc && state.center.frameCalculated === state.currentFrame ) {
        return state.center.position;
    } else {
        state.center.position = sysGraph.getCenter();
        state.center.frameCalculated = state.currentFrame
    }
    return state.center.position
}

logic.getBoundaryNodes = () => {
    const weights = sysGraph.getWeights()
    if (weights.length === 0 ) { 
        throw new Error('boundary nodes needs a graph size of > 1') //this error is being consumed in spring canvas
    }
    const boundaries = {
        minX: weights[0],
        maxX: weights[0],
        minY: weights[0],
        maxY: weights[0]
    }
    // console.log(weights, initWeight)
    sysGraph.forEach( (edgeList, w) => {
        if (w.position.x < boundaries.minX.position.x ) {
            boundaries.minX = w;
        } else if ( w.position.x > boundaries.maxX.position.x ) {
            boundaries.maxX = w
        }

        if (w.position.y < boundaries.minY.position.y) {
            boundaries.minY = w;
        } else if (w.position.y > boundaries.maxY.position.y) {
            boundaries.maxY = w
        }
    })
    return boundaries
}


logic.setSolver = ({ stepSize, maxTime }) => {
    state.solverConfig.stepSize = stepSize || state.solverConfig.stepSize
    state.solverConfig.maxTime = maxTime || state.solverConfig.maxTime
    state.solverConfig.frameCount = state.solverConfig.stepSize / state.solverConfig.maxTime
    stateChanged('structure') //needs a resolve
}

logic.getState = () => state //for debugging only

export { logic as default } 
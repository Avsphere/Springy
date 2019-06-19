import helpers from './helpers'
import sysGraph from './graph/graph' 
import solver from './solver' 
import emitter from '../emitter' 

const DEF_STEP = .05
const DEF_MAXT = 200

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
    
})

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
    if (state.currentFrame === state.solverConfig.frameCount ) {
        stateChanged() //in this case the change is self invoked...
    }
}


const solve = (clearFrames=true) => {
    state.flags.needsSolve = false;
    //the only reason clearFrames would be false is if we were adding more frames to the current animation
    if (clearFrames) {
        sysGraph.getWeights().forEach(w => w.systemData.frames = [] )
        state.currentFrame = 0;
    }
    solver.solveSystem(state.solverConfig)
}


//update and solve are only solve callers
logic.update = ({ frameIndex }) => {
    checkForSolve();
    if ( !frameIndex ) { frameIndex = state.currentFrame }
    sysGraph.getWeights().forEach(w => w.update(state.currentFrame))
    stateChanged();
}

//update and solve are only solve callers
logic.step = () => {
    checkForSolve();
    state.currentFrame++;
    sysGraph.getWeights().forEach( w => w.update(state.currentFrame) )
    stateChanged();
}


//position is true position, passer should account for relativity
logic.addWeight = ({ mass, position, springK, velocity }) => {

    if (!position.x && position.x !== 0 || !position.y && position.y !== 0 ) { throw new Error('system addWeight needs canvas x and y') }
    if (!mass) { mass = state.defaultValues.weightMass }
    if ( !springK ) { springK = state.defaultValues.springK }
    if ( !velocity ) { velocity = state.defaultValues.velocity }
    const { dist, weight } = sysGraph.findNearest(position)
    

    const snappedPosition = {
        x: position.x - position.x % state.snap,
        y: position.y - position.y % state.snap
    }

    const newWeight = sysGraph.addWeight({ position: snappedPosition, mass, velocity })
    if ( dist !== false || weight !== false ) {
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
        console.log('removing weight')
        sysGraph.removeWeight(weight)
    }
    stateChanged('structure')
}


//only settables and only location (outside of solver)... in need of a refactor
logic.setWeight = ({ weight, x, y, vx, vy, mass, fixed }) => {

    if ( x || x === 0 ) {
        weight.position.x = x
        weight.initialPosition.x = x
    }
    if ( y || y === 0 ) {
        weight.position.y = y
        weight.initialPosition.y = y
    }
    if ( vx || vx === 0 ) {
        weight.velocity.x = vx
        weight.initialVelocity.x = vx
    }
    if ( vy || vy === 0 ) {
        weight.velocity.y = vy
        weight.initialVelocity.y = vy
    }
    if ( mass || mass === 0 ) {
        weight.setMass(mass) //because this also changes the radius
    }
    if ( fixed === true || fixed === false ) {
        weight.setFixed(fixed)
    }

    stateChanged('shift')
}



logic.reset = () => {
    state = State();
    sysGraph.reset();
    stateChanged('structure')
}

logic.findNearestWeight = ({ mousePosition }) => {
    // console.log('in find nearest', relativeMousePosition)
    return sysGraph.findNearest(mousePosition)
}


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
        throw new Error('boundary nodes needs a graph size of > 1')
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
    console.log(stepSize, maxTime)
    state.solverConfig.stepSize = stepSize || state.solverConfig.stepSize
    state.solverConfig.maxTime = maxTime || state.solverConfig.maxTime
    state.solverConfig.frameCount = state.solverConfig.stepSize / state.solverConfig.maxTime
}

logic.getState = () => state //for debugging only

export { logic as default } 
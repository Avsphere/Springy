import helpers from './helpers'
import sysGraph from './graph/graph' 
import solver from './solver' 
import emitter from '../emitter' 

const State = () => ({
    currentFrame : 0,
    flags : {
        needsSolve : true
    },
    solverConfig : {
        stepSize : .05,
        maxTime : 200,
        frameCount : 200/.05
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
        systemChanged() //in this case the change is self invoked...
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


logic.addWeight = ({ mass, position, springK, velocity }) => {

    //position is the true position, the canvas handles the shift 
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

logic.moveWeight = ({ weight, relativePosition, manuallyMoved }) => {

    weight.position.x = relativePosition.x;
    weight.position.y = relativePosition.y;
    weight.initialPosition.x = relativePosition.x;
    weight.initialPosition.y = relativePosition.y;

    //manually moving a weight resets its velocity
    if (manuallyMoved === true) {
        // weight.initialVelocity.x = 0
        // weight.initialVelocity.y = 0
        // weight.velocity.x = 0
        // weight.velocity.y = 0
    }
    stateChanged('shift')
} 


logic.reset = () => {
    state = State();
    sysGraph.reset();
}

logic.findNearestWeight = ({ relativeMousePosition }) => {
    // console.log('in find nearest', relativeMousePosition)
    return sysGraph.findNearest(relativeMousePosition)
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

logic.getState = () => state //for debugging only

export { logic as default } 
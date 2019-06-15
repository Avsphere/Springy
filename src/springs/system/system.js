import helpers from './helpers'
import sysGraph from './graph/graph' 
import solver from './solver' 

const State = () => ({
    currentFrame : 0,
    solvedSystem : {
        data : [],
        meta : {
            averageVelocity : 0,
            maxVelocity : 0,
        }
    }, //solver returns as frameIndex : frameData  
    flags : {
        needsSolve : true
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
    snap : 5 //this means it rounds the x and y to the nearest 5 when spawning a weight
})

const logic = {}
let state = State();


const solve = (clearFrames=true) => {
    state.flags.needsSolve = false;
    //the only reason clearFrames would be false is if we were adding more frames to the current animation
    if (clearFrames) {
        console.log('clearing frames') 
        sysGraph.getWeights().forEach(w => w.systemData.frames = [] )
        state.currentFrame = 0;
    }
    solver.solveSystem()
}



logic.update = ({ frameIndex }) => {
    if (state.flags.needsSolve === true) {
        solve();
    }
    if ( !frameIndex ) { frameIndex = state.currentFrame }
    sysGraph.getWeights().forEach(w => w.update(state.currentFrame))
}


logic.step = () => {
    if ( state.flags.needsSolve === true ) {
        solve();
    }
    state.currentFrame++;
    sysGraph.getWeights().forEach( w => w.update(state.currentFrame) )
}


logic.addWeight = ({ mass, position, springK, velocity }) => {
    state.flags.needsSolve = true; //as this changes sys state

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

    return newWeight;
}


logic.reset = () => {
    state = State();
    sysGraph.reset();
}

logic.findNearestWeight = ({ relativeMousePosition }) => {
    console.log('in find nearest', relativeMousePosition)
    return sysGraph.findNearest(relativeMousePosition)
}


logic.moveWeight = ({weight, relativePosition, manuallyMoved}) => {
    if ( !weight || !relativePosition ) { throw new Error('moveWeight bad params')}
    state.flags.needsSolve = true; //as this changes sys state
    
    weight.position.x = relativePosition.x;
    weight.position.y = relativePosition.y;
    weight.initialPosition.x = relativePosition.x;
    weight.initialPosition.y = relativePosition.y;
    
    //manually moving a weight resets its velocity
    if ( manuallyMoved === true ) {
        // weight.initialVelocity.x = 0
        // weight.initialVelocity.y = 0
        // weight.velocity.x = 0
        // weight.velocity.y = 0
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
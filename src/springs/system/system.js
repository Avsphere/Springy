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
    }
})

const logic = {}
let state = State();


const solve = (clearFrames) => {
    state.flags.needsSolve = false;
    if (clearFrames) { 
        sysGraph.getWeights().forEach( w => w.frames = [] )
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

    const newWeight = sysGraph.addWeight({ position, mass, velocity })

    sysGraph.addEdge({ m1 : weight, m2 : newWeight, springK : springK })
    return newWeight;
}


logic.reset = () => {
    state = State();
    sysGraph.reset();
}





logic.getObjs = () => ({
    weights : sysGraph.getState().weights,
    springs : sysGraph.getState().springs
})

logic.getCenter = () => {
    if ( state.center.frameCalculated === state.currentFrame ) {
        return state.center.position;
    } else {
        state.center.position = sysGraph.getCenter();
        state.center.frameCalculated = state.currentFrame
    }
    return state.center.position
}

logic.getState = () => state //for debugging only

export { logic as default }
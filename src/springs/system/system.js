import helpers from './helpers'
import sysGraph from './graph/graph' 

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
        
    },
    center : {
        frameCalculated : 0,
        position : { x : 0, y : 0 }
    },
    defaultValues : {
        weightMass : 10,
        springK : 1,
        velocity : 0
    }
})

const logic = {}
let state = State();




const solve = () => {
    // state.solvedSystem = 
}





logic.update = ({ frameIndex }) => {
    if ( !frameIndex ) { frameIndex = state.currentFrame }
    sysGraph.forEach(o => {
        if ( o.type === 'weight' ) {
            o.update(frameIndex)
        }
    })
}


logic.step = () => {
    state.currentFrame++;
    sysGraph.forEach( o => {
        if ( o.type === 'weight' ) {
            o.update(state.currentFrame);
        }
    })
}


logic.addWeight = ({ mass, x, y, springK, velocity }) => {
    //This x,y is the true x,y. The shift is calculated in the springCanvas
    if (!mass) { mass = state.defaultValues.weightMass }
    if ( !springK ) { springK = state.defaultValues.springK }
    if ( !velocity ) { velocity = state.defaultValues.velocity }
    
    const { dist, weight } = sysGraph.findNearest({ x, y })
    const newWeight = sysGraph.addWeight({ x, y, mass, velocity})

    sysGraph.addEdge({ m1 : weight, m2 : newWeight, springK : springK })
    return newWeight;
}


logic.reset = () => {
    state = State();
}

// logic.getGraph = () => state.sysGraph;

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
    return 0;
}

logic.getState = () => state //for debugging only

export { logic as default }
import helpers from './helpers'
import sysGraph from './graph/graph' 

const State = () => ({
    currentFrame : 0,
    solvedSystem : [], //solver returns as frameIndex : frameData  
    flags : {
        
    }
})

const logic = {}
let state = State();

logic.update = ({ frameIndex }) => {
    if ( !frameIndex ) { frameIndex = state.currentFrame }
    sysGraph.forEach(o => {
        if ( o.type === 'mass' ) {
            o.update(frameIndex)
        }
    })
}

logic.draw = () => {
    sysGraph.forEach( o => o.draw() )
}

logic.solve = () => {
    // state.solvedSystem = 
}

logic.reset = () => {
    state = State();
}

export { logic as default }
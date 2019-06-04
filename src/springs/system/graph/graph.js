import Weight from './weight'
import Spring from './spring'
import helpers from '../helpers';
import { networkInterfaces } from 'os';


const logic = {}

const State = () => ({
    adjList : new Map(),
    weights : [], //for easier drawing
    springs : []
}) 
let state = State();

const Edge = ({ weight, spring }) => ({ weight, spring})

logic.addWeight = ({ x, y, mass, velocity }) => {
    const weight = Weight({ x, y, mass, velocity })
    state.adjList.set(weight, [])
    state.weights.push(weight);
    return weight
}


logic.addEdge = (w1, w2, springK=1) => {
    if ( !w1 || !w2 || !springK ) { throw new Error('add edge incorrect args ')}
    if ( w1.id === w2.id ) { throw new Error('Cannot add a circular edge')}
    const n1 = state.adjList.get(w1)
    const n2 = state.adjList.get(w2)

    if ( n1.find( ({ weight }) => weight.id === w2.id ) ) {
        throw new Error( 'cannot multiple edges between nodes')
    }

    const sharedSpring = Spring({ k: springK, weights: [w1, w2] })
    state.springs.push(sharedSpring)

    n1.push(Edge({ weight: w2, spring: sharedSpring }));
    n2.push(Edge({ weight: w1, spring: sharedSpring }));
}


logic.removeWeight = (weight) => {

}

logic.removeEdge = (spring) => {

}

logic.findNearest = (positionVec) => {
    if ( state.adjList.size === 0 ) { throw new Error('cannot find nearest when size is 0;')}
    const nearest = { dist : Infinity, weight : {} }
    
    state.adjList.forEach((edgeList, weight) => {
        const dist = helpers.eucDistance(weight.position, positionVec);
        if ( dist < nearest.dist ) { nearest.dist = dist; nearest.weight = weight; }
    })
    return nearest;
} 

logic.getCenter = () => {
    let avgX = 0, avgY = 0; 
    state.adjList.forEach( (edgeList, weight) => {
        avgX += weight.position.x;
        avgY += weight.position.y
    })
    return {
        x : avgX / state.adjList.size,
        y : avgY / state.adjList.size,
    }
}

logic.forEach = state.adjList.forEach



logic.reset = () => {
    state = State();
}

logic.getState = () => state; //only used by system



export { logic as default }
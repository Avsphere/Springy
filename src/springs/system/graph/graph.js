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

logic.addWeight = ({ position, mass, velocity }) => {
    const weight = Weight({ position, mass, velocity })
    state.adjList.set(weight, [])
    state.weights.push(weight);
    return weight
}


logic.addEdge = (w1, w2, springK=1) => {
    if ( !w1 || !w2 || !springK ) { throw new Error('add edge incorrect args ')}
    if ( w1.id === w2.id ) { throw new Error('Cannot add a circular edge')}
    const w1Edges = state.adjList.get(w1)
    const w2Edges = state.adjList.get(w2)


    if (w1Edges.find( ({ weight }) => weight.id === w2.id ) ) {
        throw new Error( 'cannot multiple edges between nodes') 
    }

    const sharedSpring = Spring({ k: springK, weights: [w1, w2] })
    state.springs.push(sharedSpring)

    w1Edges.push(Edge({ weight: w2, spring: sharedSpring }));
    w2Edges.push(Edge({ weight: w1, spring: sharedSpring }));

    return sharedSpring
}



logic.removeEdge = ({ w1, w2 }) => {
    //you can remove an edge from its spring or by its connection points; but not both
    if ( (w1 && !w2) || (w2 && !w1) ) {
        throw new Error('removeEdge only one weight was passed')        
    } else if (w1.id === w2.id) { throw new Error('removeEdge passed same weight twice') }

    const w1Edges = state.adjList.get(w1)
    const w2Edges = state.adjList.get(w2)

    const e1ToSplice = w1Edges.map( ({ weight }) => weight.id ).indexOf( w2.id )
    const e2ToSplice = w2Edges.map( ({ weight }) => weight.id ).indexOf( w1.id )

    const springToRemove = w1Edges.find(({ spring }) => spring.weights[0].id == w1.id || spring.weights[0].id == w2.id)
    const springSpliceIndex = state.springs.map(s => s.id).indexOf(springToRemove.id)
    
    if (e1ToSplice == -1 || e2ToSplice == -1) {
        throw new Error('removeEdge is not finding edge to remove')
    }
    w1Edges.splice(e1ToSplice, 1)
    w2Edges.splice(e2ToSplice, 1)
    state.springs.splice(springSpliceIndex, 1)
}

logic.removeWeight = (weightToRemove) => {
    const edges = state.adjList.get(weightToRemove)
    if (edges) {
        //can't remove edges in normal forEach because removeEdge mutates the edge array whilst iterating
        edges.map(e => e.weight).forEach( weight => {
            logic.removeEdge({ w1: weightToRemove, w2: weight })
        })

        state.adjList.delete(weightToRemove)

        const indexToSplice = state.weights.map(w => w.id).indexOf(weightToRemove.id);
        state.weights.splice(indexToSplice, 1);

    } else {
        throw new Error(`cannot find weight to remove : ${weightToRemove}`)
    }
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

logic.print = () => {
    let i = 0;
    state.adjList.forEach( (edgeList, weight) => {
        console.log(`weight${i}: `, weight, ' edges : ', edgeList)
        i++;
    })
}

logic.forEach = (fn) => {
    state.adjList.forEach(fn)
}

logic.getSize = () => state.adjList.size 

logic.reset = () => {
    state = State();
}

logic.getState = () => state; //only used by system



export { logic as default }
import Weight from './weight'
import Spring from './spring'
import helpers from '../helpers';
import { switchStatement } from 'babel-types';


const logic = {}

const State = () => ({
    adjList : new Map(),
    weights : [], //for easier drawing
    springs : [],
    debug : false
}) 
let state = State();

const Edge = ({ weight, spring }) => ({ weight, spring})


if ( state.debug ) {
    window.getGraph = () => state.adjList
    window.logGraph = () => {
        state.adjList.forEach((edgeList, w) => {
            console.log(w.id, ' has edges ', edgeList)
        })
    }
}


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
    if ((w1 && !w2) || (w2 && !w1)) {
        throw new Error('removeEdge only one weight was passed')
    } else if (w1.id === w2.id) { throw new Error('removeEdge passed same weight twice') }

    const w1Edges = state.adjList.get(w1)
    const w2Edges = state.adjList.get(w2)

    //w1 : [{weight, spring}, {weight, spring}]
    const w1Edge = w1Edges.find( ({weight}) => weight.id === w2.id )
    const w1IndexToRemove = w1Edges.indexOf(w1Edge)
    w1Edges.splice(w1IndexToRemove, 1 )

    const w2Edge = w2Edges.find(({ weight }) => weight.id === w1.id)
    const w2IndexToRemove = w2Edges.indexOf(w2Edge)
    w2Edges.splice(w2IndexToRemove, 1)

    const springIndexToRemove = state.springs.indexOf(w1Edge.spring)

    state.springs.splice(springIndexToRemove, 1)
    

}
const reconnect = () => {
    if ( state.weights.length > 1 ) {
        let newFriends = []
        state.adjList.forEach((edgeList, weight) => {
            if ( edgeList.length === 0 ) {
                newFriends.push(weight);
            }
            if (newFriends.length === 2 ) {
                logic.addEdge(...newFriends)
                newFriends = []
            }
        })
    }
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
        reconnect();

    } else {
        throw new Error(`cannot find weight to remove : ${weightToRemove}`)
    }
}

logic.findNearest = (positionVec) => {
    const nearest = { dist : Infinity, weight : {} }
    if (state.adjList.size === 0 ) { 
        if ( state.debug ) {
            console.log('findNearest cannot find when size is 0, returning falsey')
        }
        return { dist : false, weight : false } 
    }
    
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

logic.getWeights = () => state.weights
logic.getSprings = () => state.springs


logic.forEach = (fn) => {
    state.adjList.forEach(fn)
}

logic.getSize = () => state.adjList.size 

logic.reset = () => {
    state = State();
}

logic.getState = () => state; //only used by system



export { logic as default }
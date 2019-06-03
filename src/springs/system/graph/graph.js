import Mass from './mass'
import Spring from './spring'
import mapAgeCleaner from 'map-age-cleaner';

const logic = {}

const State = () => ({
    adjList : new Map(),
    defaultSpringK : 1
}) 
let state = State();

const Edge = ({ mass, spring }) => ({ mass, spring}) 

logic.addMass = ({ x, y, mass, velocity }) => state.adjList.set(Mass({ x, y, mass, velocity }), [])


logic.addEdge = ({ m1, m2, springK }) => {
    if (!springK) { springK = state.defaultSpringK}
    const sharedSpring = Spring({ k: springK, masses: [m1, m2] })
    
    const n1 = state.adjList.get(m1).push( Edge({ mass: m2, spring: sharedSpring }) );
    const n2 = state.adjList.get(m2).push( Edge({ mass: m1, spring: sharedSpring }) )

    // if ( n1.adjList.find( node => node.mass.id === m2.id ) ) {

    // }

}

logic.reset = () => {
    state = State();
}

logic.getState = () => state



export { logic as default }
import Mass from './mass'
import Spring from './spring'
import mapAgeCleaner from 'map-age-cleaner';

const logic = {}

const State = () => ({
    adjList : new Map(),
    defaultSpringK : 1
}) 
let state = State();

const Edge = ({ mass }) => ({ mass : mass, spring : Spring({})}) 

logic.addMass = ({ x, y, mass, velocity}) => state.adjList.set( Mass({x, y, mass, velocity}), new Set() );

logic.addEdge = ({ m1, m2, springK }) => {
    if (!springK) { springK = state.defaultSpringK}
    const spring = Spring({ k : springK, masses : [m1, m2] })

    state.adjList.get(v).add(w);
    state.adjList.get(w).add(v)
}

logic.reset = () => {
    state = State();
}




export { logic as default }
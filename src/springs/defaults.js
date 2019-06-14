import system from './system/system'
import graph from './system/graph/graph'
import emitter from './emitter'

//a top level module that aids in the user loading default systems


const state = {
    debug : true
}

const defaults = {}


defaults.circleSystem = () => {
    emitter.emit('orchestrator/reset', { calledBy : 'defaults/loadCircleSystem' })
    const offset = 500;
    const bigWeight = graph.addWeight({
        position: { x: offset, y: offset },
        velocity: { x: 20, y: 0 },
        mass: 50,
    })
    // const mediumMasses = ( () => {
    //     const count = 10
    //     const size = 100;
    //     for ( let i = 0; i < count; i++ ) {
    //         const m = graph.addWeight({
    //             position: { x: offset + size*Math.cos(i), y: offset + size*Math.sin(i) },
    //             velocity: { x: Math.random(), y: Math.random() },
    //             mass: 15,
    //         })
    //         graph.addEdge(bigWeight, m)
    //     }
    // })()
    let lastMass;
    const smallMasses = (() => {
        const count = 20
        const size = 300;
        for (let i = 0; i < count; i++) {
            const sign = Math.random() > .5 ? 1 : -1
            const m = graph.addWeight({
                position: { x: offset + size * Math.cos(i), y: offset + size * Math.sin(i) },
                velocity: { x: sign * Math.random() * 50, y: sign * Math.random() * 50 },
                mass: 1,
            })
            graph.addEdge(bigWeight, m)
            if (lastMass) {
                graph.addEdge(lastMass, m)
            }
            lastMass = m;
        }
    })()
    if ( state.debug ) {
        console.log('%c Default circle system loaded! ', 'color:orange')
    }
}


defaults.load = (systemNameToLoad) => {
    if (defaults.hasOwnProperty(systemNameToLoad)) {
        defaults[systemNameToLoad]();
    }
}




export { defaults as default }
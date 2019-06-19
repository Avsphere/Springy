import system from './system/system'
import graph from './system/graph/graph'
import emitter from './emitter'

//a top level module that aids in the user loading default systems


const state = {
    debug : true
}

const logic = {}

const systems = []


// defaults.basic = {
//     metadata : {
//         offset : 200
//     },
//     build : function() {
//         const metadata = this.metadata;
//         const bigWeight = graph.addWeight({
//             position: {
//                 x: 100,
//                 y: 200
//             },
//             velocity: {
//                 x: 0,
//                 y: 0
//             },
//             mass: 1000,
//         })

//         const smallWeight = graph.addWeight({
//             position: {
//                 x: 200,
//                 y: 200
//             },
//             velocity: {
//                 x: 20,
//                 y: 0
//             },
//             mass: 10,
//         })

//         graph.addEdge(bigWeight, smallWeight)


//         if (state.debug) {
//             console.log('%c Default basic system loaded! ', 'color:orange')
//         }
//     }
// }

systems.push({
    metadata : {
        description : 'Will change your life.',
        title : 'circleSystem'
    },
    build : function() {
        const offset = 500;
        const bigWeight = graph.addWeight({
            position: { x: offset, y: offset },
            velocity: { x: 0, y: 0 },
            mass: 50,
        })
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
    }
})


logic.load = (systemToLoad) => {

    // const systemToLoad = systems.find( ({ metadata })  => metadata.title === systemNameToLoad)

    if ( systemToLoad ) {
        emitter.emit('orchestrator/reset', { calledBy: 'defaultSystems/load' })

        systemToLoad.build();

        emitter.emit('orchestrator/redraw', { calledBy: 'defaultSystems/load' })
        emitter.emit('orchestrator/resetPanels', { calledBy: 'defaultSystems/load' })
        

        if ( state.debug ) {
            console.log(`%c Default system ${systemToLoad.metadata.title} loaded! `, 'color:orange')
        }
    }
}

logic.getSystems = () => systems

window.load = (s) => { logic.load(s) }



export { logic as default }
import graph from '../system/graph/graph'
import solver from '../system/solver'
import orch from '../orchestrator'

const TEST_NAME = 'solverBasicTests'

const test = {}

const addRandomWeight = (i) => graph.addWeight({
    position: { x: i, y: i },
    velocity: { x: i * 100, y: i * 100 },
    mass: Math.random() * 10,
})


let leftW, topW, rightW;

const buildGraph = () => {
    leftW = addRandomWeight(1)
    topW = addRandomWeight(2)
    rightW = addRandomWeight(3)
    const e1 = graph.addEdge(leftW, rightW)
    const e2 = graph.addEdge(leftW, topW)
    const e3 = graph.addEdge(rightW, topW)
}


test.testIc = () => {
    const ic = solver.generateICVec();
    if ( ic.length !== graph.getSize()*4 ) {
        throw new Error("incorrect length solver ic vec")
    }

    let i = 0;
    graph.forEach((edgeList, w) => {
        if (i === 0 && w !== leftW) { throw new Error('bad weight ic matchup') }
        if (i === 1 && w !== topW) { throw new Error('bad weight ic matchup') }
        if ( i === 2 && w !== rightW ) { throw new Error('bad weight ic matchup') }
        i++
    })

}

test.testUpdate = () => {
    const ic = solver.generateICVec();
    const updated = ic.map( v => v*v )

    solver.updateGraph(updated)
    let i = 0;
    graph.forEach((edgeList, w) => {
        if ( i === 0 && w.position.x !== ic[0]*ic[0] && w.velocity.y !== ic[3]*ic[3] ) {
            throw new Error('bad updateGraph : ' + i)
        }
        if (i === 1 && w.position.x !== ic[4] * ic[4] && w.velocity.y !== ic[7] * ic[7]) {
            throw new Error('bad updateGraph : ' + i)
        }
        if (i === 2 && w.position.x !== ic[8] * ic[8] && w.velocity.y !== ic[11] * ic[11]) {
            throw new Error('bad updateGraph: ' + i)
        }
        i++;
    })

}


test.funSolve = () => {
    const offset = 500;
    const bigWeight = graph.addWeight({
        position: { x: offset, y: offset },
        velocity: { x: 0, y: 0 },
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
        const count = 50
        const size = 300;
        for (let i = 0; i < count; i++) {
            const sign = Math.random() > .5 ? 1 : -1
            const m = graph.addWeight({
                position: { x: offset + size * Math.cos(i), y: offset + size * Math.sin(i) },
                velocity: { x: sign * Math.random() * 50, y: sign*Math.random()*50 },
                mass: 1,
            })
            graph.addEdge(bigWeight, m)
            if ( lastMass ) {
                graph.addEdge(lastMass, m)
            }
            lastMass = m;
        }
    })()
    solver.solveSystem();

}


test.basicSolve = () => {
    const w1 = graph.addWeight({
        position: { x: 0, y: 400 },
        velocity: { x: 50, y: 0 },
        mass: 10,
    });
    const w2 = graph.addWeight({
        position: { x: 400, y: 400 },
        velocity: { x: -50, y: 0 },
        mass: 10,
    });
    // const w3 = graph.addWeight({
    //     position: { x: 600, y: 200 },
    //     velocity: { x: 0, y: 0 },
    //     mass: 10,
    //     id: 'w3'
    // });
    const sharedSpring1 = graph.addEdge(w1, w2)
    // const sharedSpring2 = graph.addEdge(w3, w2)
    // console.log('sharedSpring,', sharedSpring)
    // sharedSpring1.setRestingLength(50);
    solver.solveSystem();
}



test.runAll = () => {
    console.log(`%cRunning all ${TEST_NAME}`, 'color:green')
    // buildGraph()
    // test.testIc();
    // test.testUpdate();
    // graph.reset();

    // test.basicSolve();
    test.funSolve();
}

test.runAll();




export { test as default }
import * as odex from "odex";
import graph from './graph/graph' 


//note that this directly mutates the weights frames within the integration cb

const state = {
    maxTime: 1,
    stepSize: .01,
    startingValue: 0,
}

const logic = {}


const integrationCb = (t, stepResults) => {
    // console.log('step calls ', stepCalls++);
    console.log('step results!', stepResults)
    // const aux = []
    // for (let i = 0; i < stepResults.length; i += 2) {
    //     aux.push([stepResults[i], stepResults[i + 1]])
    // }
    // output.push(aux)
}

const generateICVec = () => {
    const aux = []
    graph.forEach((edgeList, w) => {
        aux.push([w.position.x, w.velocity.x, w.position.y, w.velocity.y])
    })
    return aux.reduce((acc, el) => acc.concat(el), [])
}

// const setInitialFrame = () => {
//     graph.forEach((edgeList, w) => {
//         w.position.x = u[i++]
//         w.velocity.x = u[i++]
//         w.position.y = u[i++]
//         w.velocity.y = u[i++]
//     })
// }

const updateGraph = (u) => {
    //where u is the updated vector of IC form, [w0.x, w0.vx, w0.y, w0.vy]
    //forEach will take the same path
    let i = 0;
    graph.forEach((edgeList, w) => {
        w.position.x = u[i++]
        w.velocity.x = u[i++]
        w.position.y = u[i++]
        w.velocity.y = u[i++]
    })
}

const buildSystem = () => {
    console.log('building system with graph ', graph.getSize() )
    let initialConditions = generateICVec();
    let solveCalls = 0;
    const solveFn = (t, u) => {
        console.log('calls ', solveCalls++);
        updateGraph(u); //where u is the updatedIc values (here I could just push on the positions to not have to later)
        const r = []; // the diff eqs, of ic vec morph ie [ dx0, d^2x0, dy0, d^2y0, ... ]
        graph.forEach((edgeList, w) => {
            const ax = [], ay = []; //where each term is a force on the weight
            edgeList.forEach( e => {
                const w2 = e.weight;
                const spring = e.spring;
                //if w is to the left of w2, then it is being pulled right which is positive
                const iHat = (w2.position.x - w.position.x) / spring.getLength() 
                //if w is above w2, then it is being pulled down which is positive
                const jHat = (w2.position.y - w.position.y) / spring.getLength()

                ax.push(spring.k * spring.getStretch() * iHat / w.mass)
                ay.push(spring.k * spring.getStretch() * jHat / w.mass)
                
                // if ( w2.position.x > w.position.x ) {
                //     const iHat = Math.abs( (w2.position.x - w.position.x) / spring.getLength() )
                //     ax.push( spring.k*spring.getStretch()*iHat / w.mass )
                // } else {
                //     ax.push( -1 * spring.k * spring.getStretch() * w.position.x / ( spring.getLength() * w.mass ) )
                // }
                //meaning that w2 is above our weight and therefore pulling it in the positive direction
                // if ( w2.position.y > w.position.y ) {
                //     ay.push(spring.k * spring.getStretch() * w.position.y / ( spring.getLength() * w.mass ) )
                // } else {
                //     ay.push( -1 * spring.k * spring.getStretch() * w.position.y / ( spring.getLength() * w.mass ) )
                // }
            })
            const dx = w.velocity.x, dy = w.velocity.y;
            const ddx = ax.reduce((acc, el) => acc + el, 0)
            const ddy = ay.reduce( (acc, el ) => acc + el, 0)
            r.push(dx, ddx, dy, ddy)
        })
        return r;
    }

    return { initialConditions, solveFn }
}



logic.solveSystem = () => {
    const output = []

    const solver = new odex.Solver(graph.getSize()*4);
    const { initialConditions, solveFn } = buildSystem()
    solver.denseOutput = true;

    const result = solver.solve(solveFn, state.startingValue, initialConditions, state.maxTime, solver.grid(state.stepSize, integrationCb))
    console.log('output ', output)
    return output;
}


logic.generateICVec = generateICVec; //for testing
logic.updateGraph = updateGraph; //for testing

export { logic as default }

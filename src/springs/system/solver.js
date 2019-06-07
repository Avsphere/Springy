import * as odex from "odex";
import graph from './graph/graph' 


//note that this directly mutates the weights frames within the integration cb

const state = {
    maxTime: 200,
    stepSize: .05,
    startingValue: 0,
}

const logic = {}



const generateICVec = () => {
    const aux = []
    graph.forEach( (edgeList, w) => {
        aux.push([w.position.x, w.velocity.x, w.position.y, w.velocity.y])
    })
    return aux.reduce((acc, el) => acc.concat(el), [])
}


//these reason i can't mutate and update weights here is bc the t is automatically distributed and thus is not constant step size
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
        updateGraph(u); //where u is the updatedIc values (here I could just push on the positions to not have to later)
        const r = []; // the diff eqs, of ic vec morph ie [ dx0, d^2x0, dy0, d^2y0, ... ]
        graph.forEach((edgeList, w) => {
            const ax = [], ay = []; //where each term is a force on the weight
            edgeList.forEach( e => {
                const w2 = e.weight;
                const spring = e.spring;
                const springLength = spring.getLength();
                const springStretch = springLength - spring.restingLength;

                //if w is to the left of w2, then it is being pulled right which is positive
                const iHat = (w2.position.x - w.position.x) / springLength
                //if w is above w2, then it is being pulled down which is positive
                const jHat = (w2.position.y - w.position.y) / springLength

                ax.push(spring.k * springStretch * iHat / w.mass)
                ay.push(spring.k * springStretch * jHat / w.mass)

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
    const indexMap = new Map() // key : 0, value : w1, key : 4, value : w2, ...
    let output = []
    const solver = new odex.Solver(graph.getSize()*4);
    const { initialConditions, solveFn } = buildSystem()
    solver.denseOutput = true;

    let weightBlockIndex = 0; //each weight has 4 returned values, x, dx, y, dy
    graph.forEach( (edgeList, w) => {
        indexMap.set(weightBlockIndex, w)
        weightBlockIndex += 4;
    })
    const integrationCb = (t, stepResults) => {
        for ( let k = 0; k < stepResults.length; k+=4 ) {
            const w = indexMap.get(k);
            w.frames.push({
                position: { x : stepResults[k], y : stepResults[k+2] },
                velocity: { x: stepResults[k+1], y: stepResults[k+3] } 
            })
        }
    }

    const result = solver.solve(solveFn, state.startingValue, initialConditions, state.maxTime, solver.grid(state.stepSize, integrationCb))
    //setting the weights back to their starting points
    graph.forEach((edgeList, w) => {
        w.position = w.initialPosition;
        w.velocity = w.initialVelocity;
    })
    return output;
}


logic.generateICVec = generateICVec; //for testing
logic.updateGraph = updateGraph; //for testing

export { logic as default }

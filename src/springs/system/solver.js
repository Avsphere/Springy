import * as odex from "odex";
import graph from './graph/graph' 


//note that this DIRECTLY mutates the weights frames within the integration cb
//THIS IS THE ONLY NON UI COMPONENT THAT MUTATES WEIGHTS

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

const updateGraph = (u) => {
    let i = 0;
    graph.getWeights().forEach(w => {
        w.position.x = u[i++]
        w.velocity.x = u[i++]
        w.position.y = u[i++]
        w.velocity.y = u[i++]
    })
}


const buildSystem = () => {
    let initialConditions = generateICVec();
    const solveFn = (t, u) => {
        updateGraph(u)
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



//need to switch to more important tasks. Could be faster as each edge would only need to be traveled once.
//Problem is that the main bottleneck is the integration cb for well spaced results
const buildSystem_AttemptedOptimzation = () => {
    const buildIndiceMap = () => {
        const indexMap = new Map()
        let i = 0;
        graph.forEach((edgeList, w) => {
            indexMap.set(w, [i++, i++, i++, i++])
        })
        return indexMap;
    }
    const initialConditions = generateICVec();
    const indexMap = buildIndiceMap()
    let solveCalls = 0;
    const solveFn = (t, u) => {
        // console.log('in solveFN')
        indexMap.forEach(([dx, ddx, dy, ddy], w) => {
            //where if w0 then dx = 0, ddx = 1, dy = 2, ddy = 3
            w.position.x = u[dx];
            w.velocity.x = u[ddx];
            w.position.y = u[dy];
            w.velocity.y = u[ddy];
        })
        const r = Array(initialConditions.length); // the diff eqs, of ic vec morph ie [ dx0, d^2x0, dy0, d^2y0, ... ]
        const updateMap = new Map() //this maintains which weight was updated this solveFn
        graph.getSprings().forEach( s => {
            const [ w0, w1 ] = s.weights;

            const springLength = s.getLength();
            const springStretch = springLength - s.restingLength;
            

            //if w is to the left of w1, then it is being pulled right which is positive
            const iHatW0 = (w1.position.x - w0.position.x) / springLength
            //if w is above w1, then it is being pulled down which is positive
            const jHatW0 = (w1.position.y - w0.position.y) / springLength

            //if it has not started updating then its current ax, ay is 0
            const w0UpdateCache = updateMap.has(w0) ? updateMap.get(w0) : { ax : 0, ay : 0, updates : 0 }
            const w1UpdateCache = updateMap.has(w1) ? updateMap.get(w1) : { ax : 0, ay : 0, updates : 0 }
            // console.log(w0UpdateCache)
            const w0UpdateValue = {
                ax: w0UpdateCache.ax + s.k * springStretch * iHatW0 / w0.mass,
                ay: w0UpdateCache.ay + s.k * springStretch * jHatW0 / w0.mass,
                updates: w0UpdateCache.updates++
            }
            updateMap.set(w0, w0UpdateValue)
            //where the -1 * ihat, jhat is because the force in direction is equal but opposite
            updateMap.set(w1, {
                ax: w1UpdateCache.ax + s.k * springStretch * -1 * iHatW0 / w1.mass,
                ay: w1UpdateCache.ay + s.k * springStretch * -1 * jHatW0 / w1.mass,
                updates: w1UpdateCache.updates++
            })

            if ( w0UpdateCache.updates == graph.getState().adjList.get(w0).length ) {
                const dx = w0.velocity.x;
                const dy = w0.velocity.y;
                const ddx = updateMap.get(w0).ax;
                const ddy = updateMap.get(w0).ay;
                const [dx_i, ddx_i, dy_i, ddy_i ] = indexMap.get(w0);
                r[dx_i] = dx;
                r[ddx_i] = ddx
                r[dy_i] = dy
                r[ddy_i] = ddy
            }

            if (w1UpdateCache.updates == graph.getState().adjList.get(w1).length ) {
                const dx = w1.velocity.x;
                const dy = w1.velocity.y;
                const ddx = updateMap.get(w1).ax;
                const ddy = updateMap.get(w1).ay
                const [dx_i, ddx_i, dy_i, ddy_i] = indexMap.get(w1);
                r[dx_i] = dx;
                r[ddx_i] = ddx
                r[dy_i] = dy
                r[ddy_i] = ddy
            }

        })


        return r;
    }

    return {
        initialConditions,
        solveFn
    }
}

logic.solveSystem_AttemptedOptimization = () => {
    let output = []
    const solver = new odex.Solver(graph.getSize()*4);
    const { initialConditions, solveFn } = buildSystem()
    solver.denseOutput = true;

    const indexMap = new Map() // key : 0, value : w1, key : 4, value : w2, ...
    let weightBlockIndex = 0; //each weight has 4 returned values, x, dx, y, dy
    graph.forEach( (edgeList, w) => {
        indexMap.set(weightBlockIndex, w)
        weightBlockIndex += 4;
    })
    //MUTATES THE WEIGHTS
    const integrationCb = (t, stepResults) => {
        // console.log('in integration cb')
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

//for drawing a weight I want its opactiy to reflect its velocity. Thus i need each weight to have its max velocity
//adds on average about 100ms in benchmarking
const setMetadata = () => {
    graph.getWeights().forEach(w => {
        let maxVelocityX = -Infinity, minVelocityX = Infinity
        let maxVelocityY = -Infinity, minVelocityY = Infinity
        let avgVelocity = { x : 0, y : 0}
        const frameCount = w.systemData.frames.length
        w.systemData.frames.forEach( f => {
            if ( f.velocity.x > maxVelocityX ) { maxVelocityX = f.velocity.x }
            else if (f.velocity.x < minVelocityX) { minVelocityX = f.velocity.x}
            if ( f.velocity.y > maxVelocityY ) { maxVelocityY = f.velocity.y }
            else if ( f.velocity.y < minVelocityY ) { minVelocityY = f.velocity.y }
            avgVelocity.x += f.velocity.x
            avgVelocity.y += f.velocity.y
        })
        w.systemData.metadata.maxVelocity = { x: maxVelocityX, y: maxVelocityY }
        w.systemData.metadata.minVelocity = { x: minVelocityX, y: minVelocityY }
        w.systemData.metadata.avgVelocity = { x: avgVelocity.x / frameCount, y: avgVelocity.y / frameCount }
    }) 
}


logic.solveSystem = () => {
    let output = []
    const solver = new odex.Solver(graph.getSize() * 4);
    const { initialConditions, solveFn } = buildSystem()
    solver.denseOutput = true;

    const indexMap = new Map() // key : 0, value : w1, key : 4, value : w2, ...
    let weightBlockIndex = 0; //each weight has 4 returned values, x, dx, y, dy
    graph.forEach((edgeList, w) => {
        indexMap.set(weightBlockIndex, w)
        weightBlockIndex += 4;
    })
    //MUTATES THE WEIGHTS
    const integrationCb = (t, stepResults) => {
        // console.log('in integration cb')
        for (let k = 0; k < stepResults.length; k += 4) {
            const w = indexMap.get(k);
            w.systemData.frames.push({
                position: { x: stepResults[k], y: stepResults[k + 2] },
                velocity: { x: stepResults[k + 1], y: stepResults[k + 3] }
            })
        }
    }

    // const result = solver.solve(solveFn, state.startingValue, initialConditions, state.maxTime)
    const result = solver.solve(solveFn, state.startingValue, initialConditions, state.maxTime, solver.grid(state.stepSize, integrationCb))
    //setting the weights back to their starting points
    graph.forEach((edgeList, w) => {
        w.position = w.initialPosition;
        w.velocity = w.initialVelocity;
    })
    setMetadata(); //This adds things like maxVelocity to the weights, (I suspect future adds)
    return output;
}


//for testing. currently the integration cb slows by about 3x.
logic.benchmark = () => {
    const iterations = 10;
    console.log('%cBenchmarking solver with graph', 'color:blue', graph.getState().adjList )
    console.time('solverBenchmark')
    for ( let i = 0; i < iterations; i++ ) {
        logic.solveSystem();
        graph.getWeights().forEach(w => {
            w.systemData.frames = [];
        })
    }
    console.timeEnd('solverBenchmark')
}
window.benchmark = logic.benchmark
logic.generateICVec = generateICVec; //for testing

export { logic as default }

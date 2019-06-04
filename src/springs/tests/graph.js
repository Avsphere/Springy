import graph from '../system/graph/graph'

const test = {}


const addRandomWeight = () => graph.addWeight({ x: Math.random(), y: Math.random(), mass: Math.random() * 10, velocity: Math.random() * 100 })


const buildTests = () => {
    const leftW = addRandomWeight()
    const topW = addRandomWeight()
    const rightW = addRandomWeight()
    
    const e1 = graph.addEdge(leftW, rightW)
    const e2 = graph.addEdge(leftW, topW)
    const e3 = graph.addEdge(rightW, topW)

    try { graph.addEdge(leftW, rightW) } catch (err) {
        if ( !err.message.includes('multiple edges') ) {
            console.error('buildTests different error message')
        }
    }

    try { graph.addEdge(rightW, leftW) } catch (err) {
        if (!err.message.includes('multiple edges')) {
            console.error('buildTests different error message')
        }
    }

}

const removalTests = () => {
    const leftW = addRandomWeight()
    const topW = addRandomWeight()
    const rightW = addRandomWeight()

    const e1 = graph.addEdge(leftW, rightW)
    const e2 = graph.addEdge(leftW, topW)
    const e3 = graph.addEdge(rightW, topW)

    graph.removeWeight(leftW);

    //now top should have 1 edge to right and vice versa

    graph.getState().adjList.forEach( (edgeList, weight) => {
        if ( weight.id === topW.id ) {
            if ( edgeList.length !== 1 ) { throw new Error('bad edgeList length after remove') }
            if ( edgeList[0].weight.id !== rightW.id ) { throw new Error('bad edge after remove')}
        }
        if (weight.id === rightW.id) {
            if (edgeList.length !== 1) { throw new Error('bad edgeList length after remove') }
            if (edgeList[0].weight.id !== topW.id) { throw new Error('bad edge after remove') }
        }
        if ( weight.id === leftW.id ) { throw new Error('weight was not removed')}
    })


    let { springs, weights } = graph.getState();
    if ( springs.length !== 1 ) { 
        throw new Error('post remove state springs was not removed')
    } 

    if ( weights.length !== 2 ) {
        throw new Error('post remove state weights was not removed')
    }

    const newLeftW = addRandomWeight()
    graph.addEdge(newLeftW, topW)
    graph.addEdge(newLeftW, rightW)

    if (graph.getState().springs.length !== 3) {
        throw new Error('post remove state springs was not removed')
    }

    if (graph.getState().weights.length !== 3) {
        throw new Error('post remove state weights was not removed')
    }


    
}





const run = () => {
    console.log('%cRunning graph tests', "color:green")
    buildTests();
    graph.reset();
    removalTests();
}

run();




export { test as default }
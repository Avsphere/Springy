import graph from '../system/graph/graph'

const test = {}


const addRandomWeight = () => graph.addWeight({ x: Math.random(), y: Math.random(), mass: Math.random() * 10, velocity: Math.random() * 100 })


const buildTriGraph = () => {
    const leftW = addRandomWeight()
    const topW = addRandomWeight()
    const rightW = addRandomWeight()
    
    const e1 = graph.addEdge(leftW, rightW)
    const e2 = graph.addEdge(leftW, topW)
    const e3 = graph.addEdge(rightW, topW)

    try { graph.addEdge(leftW, rightW) } catch (err) {
        if ( !err.message.includes('multiple edges') ) {
            console.error('buildTriGraph different error message')
        }
    }

    try { graph.addEdge(rightW, leftW) } catch (err) {
        if (!err.message.includes('multiple edges')) {
            console.error('buildTriGraph different error message')
        }
    }
}



const run = () => {
    buildTriGraph();
    
    console.log(graph.getCenter());
}

run();




export { test as default }
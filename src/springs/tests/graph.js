import graph from '../system/graph/graph'

const test = {}

const addMasses = () => {
    Array(10).fill(0).forEach( _ => graph.addMass({ x : Math.random(), y : Math.random(), mass : Math.random()*10, velocity : Math.random()*100 }))
    console.log('masses added ', graph)
}



const run = () => {
    addMasses();
}

run();




export { test as default }
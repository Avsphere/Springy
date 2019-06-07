import Weight from '../system/graph/weight'
import Spring from '../system/graph/spring'

const TEST_NAME = 'springAndWeight'

const test = {}

const addRandomWeight = (i) => graph.addWeight({
    position: { x: i, y: i },
    velocity: { x: i * 100, y: i * 100 },
    mass: Math.random() * 10,
})

test.basics = () => {
    const w = Weight({ 
        position : { x : 1, y : 8 }, 
        velocity : { x : 0, y : 0 },
        mass : 1
    })

    const w1 = Weight({
        position: { x: 5, y: 5 },
        velocity: { x: 0, y: 0 },
        mass: 1
    })

    const s = Spring({ k : 1, lengthAtRest : 4, weights : [w, w1] })

    if ( s.getLength() !== 5 ) {
        throw new Error('bad spring getLength')
    }


    if (s.getStretch() !== 1) {
        throw new Error('bad spring getStretch')
    }

}



test.runAll = () => {
    console.log(`%cRunning all ${TEST_NAME} tests`, 'color:green')
    test.basics();
}

// test.runAll();



export { test as default }
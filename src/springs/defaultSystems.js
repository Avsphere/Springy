import system from './system/system'
import graph from './system/graph/graph'
import springCanvas from './springCanvas/springCanvas'
import emitter from './emitter'

//a top level module that aids in the user loading default systems


const state = {
    debug : true
}

const logic = {}

const systems = []

const roundToNearest = (n, roundingTo=100) => {
    const r = n % roundingTo //if 286 then 86
    if ( r > roundingTo/2 ) {
        return roundingTo - r + n;    
    } else {
        return n - r
    }
}

systems.push({
    metadata : {
        description : 'Will change your life.',
        title : 'circleSystem'
    },
    build : function() {
        const { width, height } = springCanvas.getDimensions();
        const offset = roundToNearest(width / 2);

        const fixedBig = {
            x: offset, //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const bigWeight = graph.addWeight({
            position: fixedBig,
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
        // system.setSolver({ stepSize : 0.1, maxTime : 1000 })
    }
})

systems.push({
    metadata: {
        title: 'Horiztonal, fixed at both ends',
        description: `A fixed weight at each end. Initial velocity : (30,0)`,
        initialVelocity : {
            x : 30,
            y : 0
        }
    },
    build: function () {
        const { width, height } = springCanvas.getDimensions();

        const fixedPosition1 = {
            x: roundToNearest( (width + 100) / 10), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const fixedPosition2 = {
            x: roundToNearest( width - 100), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const f1 = graph.addWeight({
            position: fixedPosition1,
            velocity: { x: 0, y: 0 },
            mass: 1,
            initiallyFixed : true
        })

        const f2 = graph.addWeight({
            position: fixedPosition2,
            velocity: { x: 0, y: 0 },
            mass: 1,
            initiallyFixed: true
        })

        const createMassChain = ( () => {
            const massCount = 10;
            const initialXVelocity = this.metadata.initialVelocity.x;
            const massSpacing = ( fixedPosition2.x - fixedPosition1.x ) / ( massCount + 1 );
            let lastMass = f1;
            
            for ( let i = 1; i <= massCount; i++ ) {
                const littleMass = graph.addWeight({
                    position: {
                        x : fixedPosition1.x + massSpacing*i,
                        y : fixedPosition1.y
                    },
                    velocity: { x: i == 1 ? initialXVelocity : 0, y: 0 },
                    mass: 10,
                })
                graph.addEdge(lastMass, littleMass)
                lastMass = littleMass;
            }
            graph.addEdge(lastMass, f2)

        })()
    }
})

systems.push({
    metadata: {
        title: 'Horiztonal, fixed at right end',
        description: `A fixed weight at each end. Initial velocity : (60,0)`,
        initialVelocity: {
            x: 30,
            y: 0
        }
    },
    build: function () {
        const { width, height } = springCanvas.getDimensions();

        const fixedPosition1 = {
            x: roundToNearest((width + 100) / 10), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const fixedPosition2 = {
            x: roundToNearest(width - 100), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const f1 = graph.addWeight({
            position: fixedPosition1,
            velocity: { x: 0, y: 0 },
            mass: 1,
            initiallyFixed: true
        })



        const createMassChain = (() => {
            const massCount = 10;
            const initialXVelocity = this.metadata.initialVelocity.x;
            const massSpacing = (fixedPosition2.x - fixedPosition1.x) / (massCount + 1);
            let lastMass = f1;

            for (let i = 1; i <= massCount; i++) {
                const littleMass = graph.addWeight({
                    position: {
                        x: fixedPosition1.x + massSpacing * i,
                        y: fixedPosition1.y
                    },
                    velocity: { x: i == 1 ? initialXVelocity : 0, y: 0 },
                    mass: 10,
                })
                graph.addEdge(lastMass, littleMass)
                lastMass = littleMass;
            }

        })()
    }
})

systems.push({
    metadata: {
        title: 'Vertical, fixed at both ends',
        description: `A fixed weight at each end. Initial velocity : (0,100). This also slows the system down to 1/5 normal speed. SPRING K = 2`,
        initialVelocity: {
            x: 0,
            y: 100
        }
    },
    build: function () {
        const { width, height } = springCanvas.getDimensions();

        const fixedPosition1 = {
            x: roundToNearest(width/2), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest((height + 100) / 10)
        }

        const fixedPosition2 = {
            x: roundToNearest(width/2), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height-100)
        }

        const f1 = graph.addWeight({
            position: fixedPosition1,
            velocity: { x: 0, y: 0 },
            mass: 1,
            initiallyFixed: true
        })

        const f2 = graph.addWeight({
            position: fixedPosition2,
            velocity: { x: 0, y: 0 },
            mass: 1,
            initiallyFixed: true
        })

        const createMassChain = (() => {
            const massCount = 10;
            const initialYVelocity = this.metadata.initialVelocity.y;
            const massSpacing = (fixedPosition2.y - fixedPosition1.y) / (massCount + 1);
            let lastMass = f1;

            for (let i = 1; i <= massCount; i++) {
                const littleMass = graph.addWeight({
                    position: {
                        x: fixedPosition1.x ,
                        y: fixedPosition1.y + massSpacing * i
                    },
                    velocity: { x: 0, y: i == 1 ? initialYVelocity : 0 },
                    mass: 10,
                })
                graph.addEdge(lastMass, littleMass, 2)
                lastMass = littleMass;
            }
            graph.addEdge(lastMass, f2, 2)

        })()
        system.setSolver({ stepSize : 0.01, maxTime : 200 })

    }
})


systems.push({
    metadata: {
        title: 'Vertical, fixed at top end',
        description: `A fixed weight at each end. Initial velocity : (0,30)`,
        initialVelocity: {
            x: 0,
            y: 30
        }
    },
    build: function () {
        const { width, height } = springCanvas.getDimensions();

        const fixedPosition1 = {
            x: roundToNearest(width / 2), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest((height + 100) / 10)
        }

        const fixedPosition2 = {
            x: roundToNearest(width / 2), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height - 100)
        }

        const f1 = graph.addWeight({
            position: fixedPosition1,
            velocity: { x: 0, y: 0 },
            mass: 1,
            initiallyFixed: true
        })


        const createMassChain = (() => {
            const massCount = 10;
            const initialYVelocity = this.metadata.initialVelocity.y;
            const massSpacing = (fixedPosition2.y - fixedPosition1.y) / (massCount + 1);
            let lastMass = f1;

            for (let i = 1; i <= massCount; i++) {
                const littleMass = graph.addWeight({
                    position: {
                        x: fixedPosition1.x,
                        y: fixedPosition1.y + massSpacing * i
                    },
                    velocity: { x: 0, y: i == 1 ? initialYVelocity : 0 },
                    mass: 10,
                })
                graph.addEdge(lastMass, littleMass)
                lastMass = littleMass;
            }

        })()
    }
})

systems.push({
    metadata: {
        title: 'Fixed Cross Over Effect X',
        description: ``,
        initialVelocity: {
            x: 0,
            y: 0
        }
    },
    build: function () {
        const { width, height } = springCanvas.getDimensions();

        const fixedPosition1 = {
            x: roundToNearest((width + 100) / 10), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const fixedPosition2 = {
            x: fixedPosition1.x + 100, //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height / 2)
        }

        const f1 = graph.addWeight({
            position: fixedPosition1,
            velocity: { x: 0, y: 0 },
            mass: 10,
        })

        const f2 = graph.addWeight({
            position: fixedPosition2,
            velocity: { x: 0, y: 0 },
            mass: 10,
        })

        graph.addEdge(f1, f2)
        system.setWeight({ weight: f2, x: f2.position.x + 200 })


    }
})

systems.push({
    metadata: {
        title: 'Fixed Cross Over Effect Y',
        description: ``,
        initialVelocity: {
            x: 0,
            y: 0
        }
    },
    build: function () {
        const { width, height } = springCanvas.getDimensions();

        const fixedPosition1 = {
            x: roundToNearest(width/2), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: roundToNearest(height/10+100)
        }

        const fixedPosition2 = {
            x: roundToNearest(width / 2), //rounding position.x to nearest 100 pixels of the first 1/10 + at least 100 pixels
            y: fixedPosition1.y + 100
        }

        const f1 = graph.addWeight({
            position: fixedPosition1,
            velocity: { x: 0, y: 0 },
            mass: 10,
        })

        const f2 = graph.addWeight({
            position: fixedPosition2,
            velocity: { x: 0, y: 0 },
            mass: 10,
        })

        graph.addEdge(f1, f2)
        system.setWeight({ weight: f2, y: f2.position.y + 200 })


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
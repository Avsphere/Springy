import shortid from 'shortid';
import emitter from '../../emitter.js'

const totalColors = [
    'rgb(182, 41, 41, 1.0)', 'rgba(18, 203, 196,1.0)', 'rgba(6, 82, 221,1.0)', 
    'rgba(237, 76, 103,1.0)', 'rgba(217, 128, 250,1.0)', 'rgba(181, 52, 113,1.0)', 'rgba(187, 88, 187,1.0)',
    'rgba(0, 148, 50,1.0)', 'rgba(27, 20, 100,1.0)', 'rgba(238, 90, 36,1.0)', 'rgba(0, 148, 50,1.0)', 'rgba(27, 20, 100,1.0)',
    'rgba(6, 82, 21,1.0)', 'rgba(87, 88, 237,1.0)'
]

const randomColor = () => totalColors[Math.floor(Math.random() * totalColors.length)]
const getRadiusFromMass = (m) => {
    if ( m > 100 ) {
        return 100;
    } else if ( m < 1 ) {
        return 1;
    } else {
        return m;
    }
}

let staticIdTracker = 0;
const genid = () => `m-${staticIdTracker++}`

const Weight = ({ position, mass, velocity, color, id, initiallyFixed }) => {
    if (!position) { throw new Error('Error creating mass, incorrect position args') }
    if (!velocity) { throw new Error('Error creating mass, incorrect velocity args') }
    const state = {
        initialPosition : {
            x: position.x,
            y: position.y,
        },
        initialVelocity : {
            x: velocity.x,
            y: velocity.y
        },
        position: {
            x: position.x,
            y: position.y,
        },
        velocity: {
            x : velocity.x,
            y : velocity.y
        },
        id: id || genid(),
        color: color || randomColor(),
        //This makes drawing in isolation easier and faster, it was a pain when pieces existed in system but not the weight
        systemData : {
            frames : [], //this holds it position and velocity at each step
            metadata : {
                maxVelocity : { x : 0, y : 0 }, //this is set in the solver and is THIS weights max / min.
                minVelocity : { x : 0, y : 0 }, //this is set in the solver.
            }
        }, 
        mass: mass || 10,
        radius : 0, // set in the init block
        type: 'weight',
        fixed : false, //sets mass to Infinity and more
        fixedSize : 20,
        preFixedMass : mass || 10
    }
    const logic = {}


    logic.update = (frameIndex=0) => {
        if (frameIndex > state.systemData.frames.length ) {
            throw new Error('out of frames!')
        }
        state.position = state.systemData.frames[frameIndex].position;
        state.velocity = state.systemData.frames[frameIndex].velocity
    }

    logic.setMass = (m) => {
        state.mass = m;
        state.radius = getRadiusFromMass(m);
    }

    logic.setFixed = (b) => {
        state.fixed = b;
        if ( state.fixed === true ) {
            state.preFixedMass = mass;
            state.initialVelocity.x = 0;
            state.initialVelocity.y = 0;
            state.velocity.x = 0;
            state.velocity.y = 0;
            state.mass = Infinity
        } else {
            state.mass = state.preFixedMass
        }

    }

    //INIT


    if (initiallyFixed === true) {
        logic.setFixed(true)
    }


    //radius is inherently a draw attribute, but others use it for things like mass placement, thus it is here for easy access
    state.radius = state.mass < 5 ? 5 : state.mass > 100 ? 100 : state.mass;

    return Object.assign(state, logic)
}

export { Weight as default }
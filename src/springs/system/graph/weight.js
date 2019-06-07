import shortid from 'shortid';
import emitter from '../../emitter.js'

const totalColors = [
    'rgb(182, 41, 41)', 'rgba(18, 203, 196,1.0)', 'rgba(6, 82, 221,1.0)', 
    'rgba(237, 76, 103,1.0)', 'rgba(217, 128, 250,1.0)', 'rgba(181, 52, 113,1.0)', 'rgba(87, 88, 187,1.0)',
    'rgba(0, 148, 50,1.0)', 'rgba(27, 20, 100,1.0)', 'rgba(238, 90, 36,1.0)'
]

const randomColor = () => totalColors[Math.floor(Math.random() * totalColors.length)]


const Weight = ({ position, mass, velocity, color, id }) => {
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
        id: id || shortid.generate(),
        color: color || randomColor(),
        frames : [], 
        mass: mass || 10,
        type: 'weight',
    }
    const logic = {}


    logic.update = (frameIndex=0) => {
        if ( frameIndex > state.frames.length ) {
            throw new Error('out of frames!')
        }
        state.position = state.frames[frameIndex].position;
        state.velocity = state.frames[frameIndex].velocity
    }





    return Object.assign(state, logic)
}

export { Weight as default }
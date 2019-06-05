import shortid from 'shortid';
import emitter from '../../emitter.js'

const totalColors = [
    'rgb(182, 41, 41)', 'rgba(18, 203, 196,1.0)', 'rgba(6, 82, 221,1.0)', 
    'rgba(237, 76, 103,1.0)', 'rgba(217, 128, 250,1.0)', 'rgba(181, 52, 113,1.0)', 'rgba(87, 88, 187,1.0)',
    'rgba(0, 148, 50,1.0)', 'rgba(27, 20, 100,1.0)', 'rgba(238, 90, 36,1.0)'
]

const randomColor = () => totalColors[Math.floor(Math.random() * totalColors.length)]


const Weight = ({ x, y, mass, velocity, color }) => {
    if (!x || !y) { throw new Error('Error creating mass, incorrect args') }
    const state = {
        position: {
            x: x,
            y: y,
        },
        velocity: velocity,
        id: shortid.generate(),
        color: color || randomColor(),
        frameData : [], 
        mass: mass || 10,
        type: 'weight',
    }
    const logic = {}


    logic.update = ({ frameIndex }) => {
        if  (!frameIndex ) { frameIndex = 0 }
        const frame = frameData[frameIndex]

        state.position.x = frame.x;
        state.position.y = frame.y;
        state.velocity = frame.velocity

    }





    return Object.assign(state, logic)
}

export { Weight as default }
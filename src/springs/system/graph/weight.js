import shortid from 'shortid';
import emitter from '../../emitter.js'


const Weight = ({ x, y, mass, velocity, color }) => {
    if (!x || !y) { throw new Error('Error creating mass, incorrect args') }
    const state = {
        position: {
            x: x,
            y: y,
        },
        velocity: velocity,
        id: shortid.generate(),
        frameData : [], 
        mass: mass || 10,
        type: 'weight',
        color: color || randomColor(),
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
import shortid from 'shortid';
import emitter from '../../emitter.js'


const Weight = ({ position, mass, velocity, color }) => {
    if (!position || !position.x || !position.y) { throw new Error('Error creating mass, incorrect position args') }
    if (!velocity || !velocity.x || !velocity.y) { throw new Error('Error creating mass, incorrect velocity args') }
    const state = {
        position: {
            x: position.x,
            y: position.y,
        },
        velocity: {
            x : velocity.x,
            y : velocity.y
        },
        id: shortid.generate(),
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
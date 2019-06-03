import shortid from 'shortid';
import emitter from '../../emitter'
import helpers from '../helpers'


const Spring = ({ k, initialLength, masses, id }) => {
    const state = {
        k: k,
        length,
        initialLength: initialLength,
        masses : masses, //[m1, m2]
        color: 'black',
        type: 'spring',
        id: id || shortid.generate(),
        display : {
            id : false,
            k : false
        }
    }


    const logic = {}

    logic.getCurrentLength = () => helpers.eucDistance(state.masses[0].position, state.masses[1].position)

    logic.draw = ({ transforms }) => {

    }



    return Object.assign(state, logic)
}


export { Spring as default }

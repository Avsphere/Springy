import shortid from 'shortid';
import emitter from '../../emitter'
import helpers from '../helpers'


const Spring = ({ k, initialLength, weights, id }) => {
    if ( !weights || weights.length !== 2 ) { throw new Error('spring is missing weights')}
    const state = {
        k: k,
        length,
        initialLength: initialLength,
        weights: weights, //[m1, m2]
        color: 'black',
        type: 'spring',
        id: id || shortid.generate(),
        display : {
            id : false,
            k : false
        }
    }


    const logic = {}

    logic.getCurrentLength = () => helpers.eucDistance(state.weights[0].position, state.weights[1].position)

    logic.draw = ({ transforms }) => {

    }



    return Object.assign(state, logic)
}


export { Spring as default }

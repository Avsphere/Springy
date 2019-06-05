import shortid from 'shortid';
import emitter from '../../emitter'
import helpers from '../helpers'


const Spring = ({ k, initialLength, weights, id }) => {
    if ( !weights || weights.length !== 2 ) { throw new Error('spring is missing weights')}
    const state = {
        k: k,
        length: helpers.eucDistance(state.weights[0].position, state.weights[1].position),
        initialLength: initialLength || helpers.eucDistance(state.weights[0].position, state.weights[1].position),
        weights: weights, //[w1, w2] order should not matter
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




    return Object.assign(state, logic)
}


export { Spring as default }

import shortid from 'shortid';
import emitter from '../../emitter'
import helpers from '../helpers'


const Spring = ({ k, lengthAtRest, weights, id }) => {
    if ( !weights || weights.length !== 2 ) { throw new Error('spring is missing weights')}
    const lengthDuringConstruction = helpers.eucDistance(weights[0].position, weights[1].position)
    const state = {
        k: k,
        restingLength: lengthAtRest || lengthDuringConstruction,
        length: lengthDuringConstruction,
        weights: weights, //[w1, w2] order should not matter
        color: 'black',
        type: 'spring',
        id: id || shortid.generate(),
        lastCalculatedLength : {
            w0 : { x : -1, y : -1 },
            w1 : { x : -1, y : -1 }  
        },
        display : {
            id : false,
            k : false
        }
    }


    const logic = {}

    logic.getLength = () => {
        state.length = Math.sqrt(
            Math.pow(state.weights[0].position.x - state.weights[1].position.x, 2) + 
            Math.pow(state.weights[0].position.y - state.weights[1].position.y, 2)
            )
        return state.length;
    }

    logic.getStretch = () => {
        return Math.abs(state.restingLength - logic.getLength() )
    }

    logic.setRestingLength = (n) => state.restingLength = n




    return Object.assign(state, logic)
}


export { Spring as default }

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
        //hopefully will save some function calls
        lastCalculatedLength : {
            w0 : { x : 0, y : 0 },
            w1 : { x : 0, y : 0 }  
        },
        display : {
            id : false,
            k : false
        }
    }


    const logic = {}

    logic.getLength = () => {
        if (
            state.weights[0].position.x === state.lastCalculatedLength.w0.x && 
            state.weights[0].position.y === state.lastCalculatedLength.w0.y && 
            state.weights[1].position.x === state.lastCalculatedLength.w1.x && 
            state.weights[1].position.y === state.lastCalculatedLength.w1.y 
        ){ 
        } else {
            state.lastCalculatedLength.w0 = weights[0].position,
            state.lastCalculatedLength.w1 = weights[1].position
            state.length = helpers.eucDistance(state.weights[0].position, state.weights[1].position);
        }
        return state.length;
    }

    logic.getStretch = () => {
        return Math.abs(state.restingLength - logic.getLength() )
    }

    logic.setRestingLength = (n) => state.restingLength = n




    return Object.assign(state, logic)
}


export { Spring as default }

import system from '../system/system'
import springCanvas from '../springCanvas/springCanvas'

/*
    This works closely with system and spring

*/

const State = () => Object.assign({

    canvas: document.getElementById('springCanvas'),
    ctx: document.getElementById('springCanvas').getContext('2d'),
    debug: true,
    drawOverlays: false, //when this is false things like mouse cursor Position will not be drawn 

})

const logic = {}
let state; //allows for an easier reset, set in init.


logic.draw = () => {
   
}


logic.getState = () => state
logic.reset = () => logic.init;

export { logic as default }
import system from '../system/system'
import springCanvas from '../springCanvas/springCanvas'
import emitter from '../emitter' 
import $ from 'jquery';

/*
    This works closely with system and springCanvas
    This sets the displayFlags that springCanvas then passes to the draw

*/

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const State = () => ({
    canvas: document.getElementById('springCanvas'),
    ctx: document.getElementById('springCanvas').getContext('2d'),
    controlWrapper: $('#controlsWrapper'),
    flagsContainer: $('#flagsContainer'),
    debug: true,

})

const logic = {}
let state; //allows for an easier reset, set in init.


//bunch of checkboxes
//whenever a checkbox is hit it changes that display flag


const setHandles = () => {

}

const buildCheckBoxes = () => {
    const boxHtml = (key, value) => {
        const checked = value === true ? 'checked' : ''
        return `<div class="form-check form-check-inline">
        <input class="form-check-input controlFlag" data-displayKey="${key}" type="checkbox" ${checked} />
        <label class="form-check-label">${key}</label>
        </div>`
    }

    const displayFlags = springCanvas.getDisplayFlags()
    const $checkBoxes = []
    for (const key in displayFlags) {
        const c = $(boxHtml(key, displayFlags[key]))
        $checkBoxes.push(c)
        $(flagsContainer).append(c) 
    }

    $checkBoxes.forEach( c => {
        c.on('click', (ev) => {
            const displayKey = $(ev.target).attr('data-displayKey');
            // console.log('here!', ev.target)
            if (displayFlags.hasOwnProperty(displayKey)) {
            console.log('here!', ev.target)

                springCanvas.setDisplayFlag(displayKey, ev.target.checked)
                emitter.emit('orchestrator/redraw', {
                    calledBy: 'panels/control/checkBoxClicked'
                })
            }
        })
    })
}






logic.init = () => {
    state = State();
    buildCheckBoxes()
}

logic.getState = () => state
logic.reset = () => { logic.init() };


//for testing
window.monitor = logic


export { logic as default }
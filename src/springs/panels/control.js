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
    timeContainer : $('#timeControl'),
    debug: true,

})

const logic = {}
let state; //allows for an easier reset, set in init.


//bunch of checkboxes
//whenever a checkbox is hit it changes that display flag



const buildCheckBoxes = () => {
    state.flagsContainer.html('')
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
        state.flagsContainer.append(c) 
    }

    $checkBoxes.forEach( c => {
        c.on('click', (ev) => {
            const displayKey = $(ev.target).attr('data-displayKey');
            // console.log('here!', ev.target)
            if (displayFlags.hasOwnProperty(displayKey)) {

                springCanvas.setDisplayFlag(displayKey, ev.target.checked)
                emitter.emit('orchestrator/redraw', {
                    calledBy: 'panels/control/checkBoxClicked'
                })
            }
        })
    })
}

const buildTimeControl = () => {
    const buildInput = () => {
        const inlineStyle = `background-color : rgba(27, 20, 100,0.5)`

        //code that is making me want to cry... need to level up my game here... also need to stop wasting time
        const html = `<div id="timeControllerContainer">
        <div class="card" style="margin-top : 5%;">
        <div class="card-header" id=""style="${inlineStyle}; text-align:center;">
            <span> <h4> Time Controller </h4> </span>
        </div>
        </div>
            <div class="input-group mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-default">Step Size</span>
        </div>
        <input type="text" class="form-control" id="stepSize" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="i.e 0.5">
        </div>
        <div class="input-group mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-default">Max Time</span>
        </div>
        <input type="text" class="form-control" id="maxTime" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="i.e 200">
        </div>
        </div>`
        return html;
    }
    const $inputContainer = $(buildInput())
    
    $inputContainer.on('keyup', (ev) => {
        const target = ev.target;
        const val = Number.parseFloat($(target).val())
        if (ev.keyCode == 32) {
            $(':focus').blur() 
        }
        else if ( target.id === 'stepSize' && !isNaN(val) ) {
            system.setSolver({ stepSize : val })
        } else if (target.id === 'maxTime' && !isNaN(val)) {
            system.setSolver({ maxTime : val })
        }
    })
    state.timeContainer.html($inputContainer)
}






logic.init = () => {
    state = State();
    buildCheckBoxes()
    buildTimeControl();
}

logic.getState = () => state
logic.reset = () => { logic.init() };


//for testing
window.monitor = logic


export { logic as default }
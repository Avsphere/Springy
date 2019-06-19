import system from '../system/system'
import springCanvas from '../springCanvas/springCanvas'
import emitter from '../emitter' 
import $ from 'jquery';
import defaultSystems from '../defaultSystems'


const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const State = () => ({
    canvas: document.getElementById('springCanvas'),
    ctx: document.getElementById('springCanvas').getContext('2d'),
    defaultsWrapper: $('#defaultsWrapper'),
    debug: true,

})

const logic = {}
let state; //allows for an easier reset, set in init.


//bunch of checkboxes
//whenever a checkbox is hit it changes that display flag

const buildDefaultSystemCard = (system) => {
    const { metadata } = system; //don't want to call build directly

    const html = `<div class="card" style="margin-top:5%; cursor: pointer;">
    <div class="card-header" id=""style="background-color : rgba(6, 82, 221,0.5)">
        ${metadata.title}
    </div>
    <ul class="list-group list-group-flush">
        <li class="list-group-item" id="">${metadata.description}</li>
    </ul>
    </div>`


    const $card = $(html)

    $card.on('click', (ev) => {
        defaultSystems.load(system)
    })

    state.defaultsWrapper.append($card)
}


const buildPanel = () => {
    const titleHtml = `<h2> Click the default system to load it! </h2>`
    state.defaultsWrapper.html(titleHtml)
    const systems = defaultSystems.getSystems()
    systems.forEach(buildDefaultSystemCard)
}







logic.init = () => {
    console.log('init default panel')
    state = State();
    buildPanel();
}

logic.getState = () => state
logic.reset = () => { logic.init() };



export { logic as default }
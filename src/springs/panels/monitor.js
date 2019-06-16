import system from '../system/system'
import springCanvas from '../springCanvas/springCanvas'
import emitter from '../emitter' 
import $ from 'jquery';

/*
    This works closely with system and springCanvas. It is a more specific system interaction tool

*/

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const State = () => ({

    canvas: document.getElementById('springCanvas'),
    ctx: document.getElementById('springCanvas').getContext('2d'),
    monitorWrapperId : '#monitorWrapper',
    monitorDisplayId: '#monitorDisplay',
    headerWrapperId: '#monitorHeader',
    setterWrapperId: '#monitorSetter',
    debug: true,

})

const logic = {}
let state; //allows for an easier reset, set in init.
let hasSubscribed = false; //On resets I am not resubscribing
let updateMonitorFn; //set on instantiation 

const trimId = (oId) => oId.substr(0, 4)

const buildWeightHtml = (w) => {
    const color = updateOpacity(w.color, .5)
    const inlineStyle = `background-color : ${color}`
    const html = `<div class="input-group mb-2 weightInput">
                        <div class="input-group-prepend">
                            <span class="input-group-text" style="${inlineStyle}">${trimId(w.id)}</span>
                        </div>
                        <input type="text" class="form-control" id="xValue_${w.id}" >
                        <input type = "text" class = "form-control velocityValue" id="velocity_${w.id}">
                        <input type="text" class="form-control" id="w_${w.id}" >
                        </div>`

    return html;
}



//this is called from the subscribed emit found in the init
const update = (changeType) => {
    if ( changeType === 'structure' ) {
        //in this case another mass may have been added so I need to rebuild html
        logic.buildMonitorDisplay()
    } else if ( changeType === 'shift' || changeType === 'state' ) {
        updateMonitorFn()
    }
    
}

 
//builds a single card




const buildBaseHtml = () => {
    const html = `
    <div id="${state.headerWrapperId}">
    <h4> Click a list item to set its values and view its springs </h4>
    </div>
    `
    $(state.monitorWrapperId).append(html)
    return html
}



//what is built when you clikc on one of the weight items
const buildSetter = (w) => {
    const posXId = `posX${w.id}`
    const posYId = `posY${w.id}`
    const velXId = `velX${w.id}`
    const velYId = `velY${w.id}`
    const massId = `mass${w.id}`
    const buildInputRow = () => {
        const color = updateOpacity(w.color, .5)
        const inlineStyle = `background-color : ${color}`

        //code that is making me want to cry... need to level up my game here... also need to stop wasting time
        const html = `<div class="card" style="width: 85%;">
        <div class="card-header" id=""style="${inlineStyle}">
            <span> Setting Weight Id : ${trimId(w.id)} </span>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item" ><div class="row">
                            <div class="col-sm-6">
                            <input type="text" class="form-control" placeholder="pos x" id="${posXId}" >
                            </div>
                            <div class="col-sm-6">
                            <input type="text" class="form-control" placeholder="pos y" id="${posYId}" >
                            </div></li>
            <li class="list-group-item" ><div class="row">
                            <div class="col-sm-6">
                            <input type="text" class="form-control" placeholder="vel x" id="${velXId}" >
                            </div>
                            <div class="col-sm-6">
                            <input type="text" class="form-control" placeholder="vel y" id="${velYId}" >
                            </div></li>
            <li class="list-group-item" ><div class="row">
                            <div class="col-sm-12">
                            <input type="text" class="form-control" placeholder="mass" id="${massId}" >
                            </div>
                            </li>
        </ul>
        </div>`
        return html;
    }

    const setterCard = $(buildInputRow())

    setterCard.on('keyup', (ev) => {
        
        const target = ev.target;
        const val = Number.parseFloat($(target).val())

        if (ev.keyCode == 32) {
            return; //NO SPACES
        }
        if (!isNaN(val)) {
            emitter.emit('orchestrator/stopAnimation', { calledBy: 'panels/monitor/setterCardKeyup' })
            if ( target.id.includes(posXId) ) {
                system.setWeight({ weight: w, x: val })

            } else if (target.id.includes(posYId) ) {
                system.setWeight({ weight: w, y: val })

            } else if (target.id.includes(velXId)) {
                system.setWeight({ weight: w, vx: val })

            } else if (target.id.includes(velYId)) {
                system.setWeight({ weight: w, vy: val })

            } else if (target.id.includes(massId)) {
                system.setWeight({ weight: w, mass: val })

            }
            //now redraw to reflect
            emitter.emit('orchestrator/redraw', { calledBy: 'panels/monitor/setterCardKeyup' })
        } 
    })



    $(state.setterWrapperId).html(setterCard)
}



logic.buildMonitorDisplay = () => {
    const buildMonitorDisplayCard = (w) => {
        const velocityId = `vel_${w.id}`
        const positionId = `pos_${w.id}`
        const headerId = `header_${w.id}`

        const velocityHtml = `Velocity : (${w.velocity.x.toFixed(2)}, ${w.velocity.y.toFixed(2)})`
        const positionHtml = `Position : (${w.position.x.toFixed(2)}, ${w.position.y.toFixed(2)})`
        const headerHtml = `<span> Id : ${trimId(w.id)} <span style="float:right"> Mass : ${w.mass.toFixed(2)}</span> </span>`
        const color = updateOpacity(w.color, .5)
        const inlineStyle = `background-color : ${color}`

        const html = `<div class="card" style="width: 85%;">
        <div class="card-header" id="${headerId}"style="${inlineStyle}">
            ${headerHtml}
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item" id="${positionId}">${positionHtml}</li>
            <li class="list-group-item" id="${velocityId}">${velocityHtml}</li>
        </ul>
        </div>`

        const weightCard = $(html)

        weightCard.on('click', (ev) => {
            buildSetter(w)
        })

        return weightCard
    }
    $(state.monitorDisplayId).html('')

    const { weights, springs } = system.getObjs();

    const displayCards = weights.map(buildMonitorDisplayCard)
    $(state.monitorDisplayId).append(displayCards)
    
    const update = () => {
        const { weights, springs } = system.getObjs();
        weights.forEach(w => {
            const $velocity = $(`#vel_${w.id}`)
            const $position = $(`#pos_${w.id}`)
            const $header = $(`#header_${w.id}`)
            const velocityHtml = `Velocity : (${w.velocity.x.toFixed(2)}, ${w.velocity.y.toFixed(2)})`
            const positionHtml = `Position : (${w.position.x.toFixed(2)}, ${w.position.y.toFixed(2)})`
            const headerHtml = `<span> Id : ${trimId(w.id)} <span style="float:right"> Mass : ${w.mass.toFixed(2)}</span> </span>`

            $position.html(positionHtml)
            $velocity.html(velocityHtml)
            $header.html(headerHtml)
        }) 
    }
    return update;
}












logic.init = () => {
    state = State();
    // $(state.headerWrapperId).html(buildBaseHtml());
    //currently i am keeping emits at a singleton level, not sure how it will work
    $(state.setterWrapperId).html('') //clear the previous setter box if there was one
    updateMonitorFn = logic.buildMonitorDisplay();
    if ( !hasSubscribed ) {
        const systemSubscription = 'panel-systemOnChange-sub'
        system.subscribeToOnChange(systemSubscription)
        emitter.on(systemSubscription, ({ changeType }) => {
            update(changeType);
        })
        hasSubscribed = true;
    }

    $(state.monitorDisplayId).css('height', window.innerHeight / 2)

}

logic.getState = () => state
logic.reset = () => { logic.init() };


//for testing
window.monitor = logic


export { logic as default }
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
const clearSetter = () => {
    $(state.setterWrapperId).html('') //clear the previous setter box if there was one
}




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
    const displayId = `setterDisplay${w.id}`
    const buildInputRow = () => {
        const color = w.fixed ? 'rgb(0, 0, 0, .4)' : updateOpacity(w.color, .5)
        const inlineStyle = `background-color : ${color}`
        const isDisabled = w.fixed === true ? 'disabled' : ''

        //code that is making me want to cry... need to level up my game here... also need to stop wasting time
        const html = `<div class="card" style="width: 85%;">
        <div class="card-header" id="${displayId}"style="${inlineStyle}">
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
                            <input type="text" class="form-control" placeholder="vel x" ${isDisabled} id="${velXId}" >
                            </div>
                            <div class="col-sm-6">
                            <input type="text" class="form-control" placeholder="vel y" ${isDisabled} id="${velYId}" >
                            </div></li>
            <li class="list-group-item" ><div class="row">
                            <div class="col-sm-6">
                            <input type="text" class="form-control" placeholder="mass" ${isDisabled} id="${massId}" >
                            </div>
                            <div class="col-sm-6">
                                <div class="form-check form-check-inline" style="margin-top:5%">
                                <input class="form-check-input controlFlag" id="fixMass" type="checkbox" />
                                <label class="form-check-label">Fixed</label>
                                </div>
                            </div>
                            </li>
        </ul>
        </div>`
        return html;
    }

    const updateStylingForFixedMass = () => {
        const headerId = `headerDisplay_${w.id}` //this is from the buildMonitorDisplayCard
        const color = w.fixed ? 'rgb(0, 0, 0, .4)' : updateOpacity(w.color, .5)
        $(`#${displayId}`).css('background-color', color)
        $(`#${headerId}`).css('background-color', color)
        $(`#${velXId}`).attr('disabled', w.fixed)
        $(`#${velYId}`).attr('disabled', w.fixed)
        $(`#${massId}`).attr('disabled', w.fixed)
    }

    const setterCard = $(buildInputRow())

    setterCard.on('keyup', (ev) => {
        
        const target = ev.target;
        const val = Number.parseFloat($(target).val())


        if (!isNaN(val)) {
            emitter.emit('orchestrator/stopAnimation', { calledBy: 'panels/monitor/setterCardKeyup' })
            if ( target.id.includes(posXId) ) {
                system.set({ weight: w, x: val })

            } else if (target.id.includes(posYId) ) {
                system.set({ weight: w, y: val })

            } else if (target.id.includes(velXId) && w.fixed === false ) {
                system.set({ weight: w, vx: val })

            } else if (target.id.includes(velYId) && w.fixed === false ) {
                system.set({ weight: w, vy: val })

            } else if (target.id.includes(massId) && w.fixed === false) {
                system.set({ weight: w, mass: val })

            }
            //now redraw to reflect
            emitter.emit('orchestrator/redraw', { calledBy: 'panels/monitor/setterCardKeyup' })
        } 
    })

    setterCard.on('click', (ev) => {
        const target = ev.target;
        if ( target.id === 'fixMass') {
            system.set({weight : w, fixed : !w.fixed })
            updateStylingForFixedMass()
            $(':focus').blur() 
            emitter.emit('orchestrator/redraw', { calledBy: 'panels/monitor/setterCardKeyup' })
        }
    })



    $(state.setterWrapperId).html(setterCard)
}



logic.buildMonitorDisplay = () => {
    const buildMonitorDisplayCard = (w) => {
        const velocityId = `vel_${w.id}`
        const positionId = `pos_${w.id}`
        const headerId = `headerDisplay_${w.id}`

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

        weightCard.on('mousedown', (ev) => {

            const rightClick = ev.which === 3 ? true : false
            if ( rightClick ) {
                system.removeWeight(w)
                clearSetter();
                emitter.emit('orchestrator/redraw', { calledBy: 'panels/monitor/setterCardDeleteWeight' })
            } else {
                buildSetter(w)
            }
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
            const $header = $(`#headerDisplay_${w.id}`)
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
    clearSetter();
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



export { logic as default }
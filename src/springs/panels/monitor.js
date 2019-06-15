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
    setterWrapperId : '#setterWrapper',
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
const buildMonitorDisplayCard = (w) => {
    const velocityId = `vel_${w.id}`
    const positionId = `pos_${w.id}`
    const massId = `mass_${w.id}`

    const velocityHtml = `Velocity : (${w.velocity.x.toFixed(2)}, ${w.velocity.y.toFixed(2)})`
    const positionHtml = `Position : (${w.position.x.toFixed(2)}, ${w.position.y.toFixed(2)})`
    const massHtml = `Mass : ${w.mass}`
    const color = updateOpacity(w.color, .5)
    const inlineStyle = `background-color : ${color}`

    const html = `<div class="card" style="width: 85%;">
        <div class="card-header" style="${inlineStyle}">
            W : ${trimId(w.id)}
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item" id="${positionId}">${positionHtml}</li>
            <li class="list-group-item" id="${velocityId}">${velocityHtml}</li>
            <li class="list-group-item" id="${massId}" >${massHtml}</li>
        </ul>
        </div>`
    
    const weightCard = $(html)
    
    // weightInput.on('click', (ev) => {
    //     console.log('keyup on w input ', w)
    // })

    return weightCard
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



logic.buildMonitorDisplay = () => {
    console.log('building')
    $(state.monitorDisplayId).html('')

    const { weights, springs } = system.getObjs();

    const displayCards = weights.map(buildMonitorDisplayCard)
    $(state.monitorDisplayId).append(displayCards)
    
    const update = () => {
        const { weights, springs } = system.getObjs();
        weights.forEach(w => {
            const $velocity = $(`#vel_${w.id}`)
            const $position = $(`#pos_${w.id}`)
            const $mass = $(`#mass_${w.id}`)
            const velocityHtml = `Velocity : (${w.velocity.x.toFixed(2)}, ${w.velocity.y.toFixed(2)})`
            const positionHtml = `Position : (${w.position.x.toFixed(2)}, ${w.position.y.toFixed(2)})`
            const massHtml = `Mass : ${w.mass}`

            $position.html(positionHtml)
            $velocity.html(velocityHtml)
            $mass.html(massHtml)
            // $($velocityId).value('bird')

        }) 
    }
    return update;
}










logic.draw = () => {
   
}



logic.init = () => {
    state = State();
    // $(state.headerWrapperId).html(buildBaseHtml());
    //currently i am keeping emits at a singleton level, not sure how it will work
    updateMonitorFn = logic.buildMonitorDisplay();
    if ( !hasSubscribed ) {
        const systemSubscription = 'panel-systemOnChange-sub'
        system.subscribeToOnChange(systemSubscription)
        emitter.on(systemSubscription, ({ changeType }) => {
            update(changeType);
        })
        hasSubscribed = true;
    }


}

logic.getState = () => state
logic.reset = () => { logic.init() };


//for testing
window.monitor = logic


export { logic as default }
import system from '../system/system'
import emitter from '../emitter'

let state = {} //set in init, this is exactly the springCanvas state

//this keeps track of user actions / associated values
const handlerState = {
    mouseWheel : 0,
    //set to their defaults then changed by handlers
    weight : {
        mass : 10,
        velocity : 0
    },
    spring : {
        k : 1
    }
}

const getMousePosition = (ev) => ({
    x: ev.clientX - state.canvas.getBoundingClientRect().left,
    y: ev.clientY - state.canvas.getBoundingClientRect().top
})


const getRelativeMousePosition = (ev) => {
    const { x, y } = getMousePosition(ev);
    //everything is relative to systemCenter. so if x was 0 then the relative position would be sysCenter - (canvasCenter - x)
    const canvasCenter = {
        x: state.canvas.width / 2,
        y: state.canvas.height / 2
    }
    const sysCenter = system.getCenter()
    return {
        x: sysCenter.x - (canvasCenter.x - x),
        y: sysCenter.y - (canvasCenter.y - y)
    }
}


const handleLeftClick = (ev) => {
    const { x, y } = getRelativeMousePosition(ev);
    emitter.emit('orchestrator/stopAnimation', { calledBy : 'springCanvas/listenAndHandle/handleLeftClick'})
    // console.log('true mouse: ', trueMouse)
    // console.log('relative mouse ', x, y)
    const weightConfig = { 
        mass: handlerState.weight.mass,
        position : { x : x, y : y },
        springK : handlerState.spring.k,
        velocity: handlerState.weight.velocity
    }
    const newWeight = system.addWeight(weightConfig)
    if (state.debug) {
        const trueMouse = getMousePosition(ev)
        console.log('listenAndHandle leftclick spawning weight ', newWeight)
        console.log('true mouse: ', trueMouse)
        console.log('relative mouse ', x, y)
    }



}

const handleRightClick = (ev) => {

}

const handleMouseUp = (ev) => {

}

const handleMouseMove = (ev) => {

}

//these are all of the spring canvas listeners and their associated handlers
const initListenAndHandle = (springCanvasState) => {
    state = springCanvasState //as this is a direct child only here for beauty

    // canvas.addEventListener('keyup', handleKeyup)

    state.canvas.addEventListener('mousedown', (ev) => {
        ev.preventDefault()
        const rightClick = ev.which === 3 ? true : false

        if (rightClick) {
            handleRightClick(ev);
        } else {
            handleLeftClick(ev);
        }
    })

    state.canvas.addEventListener('mouseup', handleMouseUp)

    state.canvas.addEventListener('mousemove', handleMouseMove)
     
    
}







export { initListenAndHandle as default }
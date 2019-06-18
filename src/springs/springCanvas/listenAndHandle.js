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
    },
    mouseMove : {
        throttle : 5, //only captures every x mouseMove calls
        calls : 0 //is incremented by 1 each call
    },
    clickBuffer: 5, //x px away + whatever for easier selecting
    spawnBuffer : 15, //x px away + whatever to prevent spawning massess too close
    debug : {
        dragHandler : true,
        leftClick : false
    },
    dragHandler: {}, //set when the weight is being dragged
    useRelative : false
}

const getMousePosition = (ev) => ({
    x: ev.clientX - state.canvas.getBoundingClientRect().left,
    y: ev.clientY - state.canvas.getBoundingClientRect().top
})


const getRelativeMousePosition = (ev) => {
    const { x, y } = getMousePosition(ev);

    return {
        exact : { x : x, y : y },
        relative: { x: x + state.transforms.shift.x, y: y + state.transforms.shift.y }
    }
}


const removeDragHandler = () => {
    state.canvas.removeEventListener('mousemove', handlerState.dragHandler)
}

const initDragHandler = (weight) => (ev) => {
    const { exact, relative } = getRelativeMousePosition(ev);
    const mousePosition = handlerState.useRelative ? relative : exact

    const inXBounds = exact.x > 10 && exact.x < state.canvas.width - 10
    const inYBounds = exact.y > 10 && exact.y < state.canvas.height - 10
    if ( !inXBounds || !inYBounds ) {
        removeDragHandler();
    } else {
        system.setWeight({ weight, ...mousePosition, manuallyMoved : true })
        emitter.emit('orchestrator/redraw', { calledBy: 'springCanvas/listenAndHandle/dragHandler' })
    }
}




const handleLeftClick = (ev) => {
    const { exact, relative } = getRelativeMousePosition(ev);
    const mousePosition = handlerState.useRelative ? relative : exact

    emitter.emit('orchestrator/stopAnimation', { calledBy : 'springCanvas/listenAndHandle/handleLeftClick'})


    //if there is a nearby weight then i select it;

    const { dist, weight } = system.findNearestWeight({ mousePosition : mousePosition })
    if (dist !== false && weight !== false && dist < handlerState.spawnBuffer + weight.radius ) {
        handlerState.dragHandler = initDragHandler(weight)
        
        emitter.once('springCanvas/listenAndHandle/stopDragHandler', (d) => {
            if (handlerState.debug.dragHandler ) {
                console.log('%c dragHandler emit caught. calledBy (should be only orchestrator) ', d.calledBy)
            }
            removeDragHandler()
        })

        state.canvas.addEventListener('mousemove', handlerState.dragHandler )
    } else {
        const weightConfig = {
            mass: handlerState.weight.mass,
            position: { x: mousePosition.x, y: mousePosition.y },
            springK: handlerState.spring.k,
            velocity: handlerState.weight.velocity
        }
        const newWeight = system.addWeight(weightConfig)
        //I need to redraw to show new weight
        emitter.emit('orchestrator/redraw', { calledBy: 'springCanvas/listenAndHandle/handleLeftClick' })
    }


    if (handlerState.debug.leftClick) {
        console.log('listenAndHandle leftclick spawning weight ', newWeight)
        console.log('exact mouse: ', exact)
        console.log('relative mouse ', relative)
    }



}

const handleRightClick = (ev) => {

}

const handleMouseUp = (ev) => {
    removeDragHandler() //always test for a remove

}

//This sets the mouseMove state value which is used in the springCanvas draw loop
const handleMouseMove = (ev) => {
    if ( state.displayFlags.cursorPosition && handlerState.mouseMove.calls++ % handlerState.mouseMove.throttle == 0 ) {
        state.lastMousePosition = getRelativeMousePosition(ev);
    }
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
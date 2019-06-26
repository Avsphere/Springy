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
    clickBuffer : 15, //x px away + whatever to prevent spawning massess too close
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
        system.set({ weight, ...mousePosition, manuallyMoved : true })
        emitter.emit('orchestrator/redraw', { calledBy: 'springCanvas/listenAndHandle/dragHandler' })
    }
}




const handleLeftClick = (ev) => {
    const { exact, relative } = getRelativeMousePosition(ev);
    const mousePosition = handlerState.useRelative ? relative : exact

    emitter.emit('orchestrator/stopAnimation', { calledBy : 'springCanvas/listenAndHandle/handleLeftClick'})


    //if there is a nearby weight then i select it;

    const { weightDist, weight } = system.findNearest({ mousePosition : mousePosition })
    if (weight !== false && weightDist < handlerState.clickBuffer + weight.radius ) {
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
    const { exact, relative } = getRelativeMousePosition(ev);
    const mousePosition = handlerState.useRelative ? relative : exact;
    emitter.emit('orchestrator/stopAnimation', { calledBy: 'springCanvas/listenAndHandle/handleRightClick' })
    
    const { weightDist, weight, spring, springDist } = system.findNearest({ mousePosition: mousePosition })
    if (weight !== false && weightDist < handlerState.clickBuffer + weight.radius) {
        system.removeWeight(weight)
    } else if (spring !== false && springDist < handlerState.clickBuffer + spring.k * spring.displayScalar) {
        system.removeSpring(spring)
    }
    emitter.emit('orchestrator/redraw', { calledBy: 'springCanvas/listenAndHandle/handleRightClick' })
}

const handleMouseUp = (ev) => {
    removeDragHandler() //always test for a remove
}

const handleIncrement = (ev, incrementAmount) => {
    const mousePosition = handlerState.useRelative ? state.lastMousePosition.relative : state.lastMousePosition.exact;
    emitter.emit('orchestrator/stopAnimation', { calledBy: 'springCanvas/listenAndHandle/handleIncrement' })
    const { weightDist, weight, spring, springDist } = system.findNearest({ mousePosition: mousePosition })
    
    
    if (weight !== false && weightDist < handlerState.clickBuffer + weight.radius && weight.mass > 1) {
        system.set({weight, mass : weight.mass + incrementAmount})
    } 
    
    else if (spring !== false && springDist < handlerState.clickBuffer + spring.k * spring.displayScalar && spring.k > .1) {
        system.set({ spring, k: spring.k + incrementAmount/2 })
    }
    emitter.emit('orchestrator/redraw', { calledBy: 'springCanvas/listenAndHandle/handleIncrement' })
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



    state.canvas.addEventListener('mousedown', (ev) => {
        ev.preventDefault()
        const rightClick = ev.which === 3 ? true : false

        if (rightClick) {
            handleRightClick(ev);
        } else {
            handleLeftClick(ev);
        }
        $(':focus').blur() 

    })

    window.addEventListener('keyup', (ev) => {
        //while this is on window incase focus is off, it only works if the canvas is being shown
        if ( state.inFocus ) {
            if ( ev.key === '+' || ev.key === '=' ) {
                handleIncrement(ev, 1);
            } else if (ev.key === '-' || ev.key === '_') {
                handleIncrement(ev, -1);
            }
        }
    })

    state.canvas.addEventListener('wheel', (ev) => {
        ev.preventDefault()
        const scalar = ev.deltaY < 0 ? 1 : -1
        handleIncrement(ev, scalar);
    })

    state.canvas.addEventListener('mouseup', handleMouseUp)

    state.canvas.addEventListener('mousemove', handleMouseMove) //very important, this store previous mouse positions for different events
     
    
}







export { initListenAndHandle as default }
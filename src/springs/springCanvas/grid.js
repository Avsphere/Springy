const logic = {}

const state = {
    defaultContext : window.springCanvas.ctx
}


logic.draw = ({ transforms, context }) => {
    if ( !context ) { context = state.defaultContext }
    
}



export { logic as default }
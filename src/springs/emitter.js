const EventEmitter = require('events')



const emitter = new EventEmitter()

emitter.setMaxListeners(0)


export { emitter as default }

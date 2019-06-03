import { parse as urlParse } from 'url'

const logic = {}

//establishes globals
window.globals = {};

logic.init = async () => {
    console.log('in the main init')
    const { pathname } = urlParse(window.location.href)
    const page = pathname.split('/').pop().toLocaleLowerCase()

    if (!window.localStorage.getItem('key')) {
        window.localStorage.setItem('key', shortid.generate())
    }


}



export { logic as default }

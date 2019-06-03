import { parse as urlParse } from 'url'
import view from './view.js';
import shortid from 'shortid';
import tests from './tests/allTests';
import system from './system/system';

const logic = {}

//establishes globals

logic.init = async() => {
    console.log('in the main init')
    const { pathname } = urlParse(window.location.href)
    const page = pathname.split('/').pop().toLocaleLowerCase()
    
    if (!window.localStorage.getItem('key')) {
        window.localStorage.setItem('key', shortid.generate())
    }

    window.user = {
        key: window.localStorage.getItem('key'),
        systems: [], 
        systemIndex: 0,
    }
    window.view = {};
    window.dbug = {};
    window.tests = tests
    window.springCanvas = document.getElementById('springCanvas')
    window.springCanvas.ctx = window.springCanvas.getContext('2d');
    window.System = system
    view.init(); //top level

}



export { logic as default }

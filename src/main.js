import { parse as urlParse } from 'url'
import $ from 'jquery';
import axios from 'axios'
import 'popper.js';
import 'bootstrap'
import learning from './learning/main.js'
import springs from './springs/main.js'
window.$ = $
window.axios = axios;


const { pathname } = urlParse(window.location.href)






const init = async() => {
  if (pathname.includes('learning')) {
    learning.init()
  } else if (pathname.includes('spring')) {
    await springs.init()
  } else {
    await springs.init() //making default for demo purposes
  }
}


init();
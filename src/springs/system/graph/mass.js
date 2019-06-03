import shortid from 'shortid';
import emitter from '../../emitter.js'

const toRgb = (hex, opacity = 0) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const totalColors = [
    "#673AB7", "#009688", "#ff6922", "#2196F3", "#4CAF50", "#F44336", "#F49B3B",
    "#3F51B5", "#E91E63", "#607D8B", "#9C27B0", "#CDDC39", "#00BCD4",
];


const randomColor = () => totalColors[Math.floor(Math.random() * totalColors.length)]

const getRadiusFromMass = ( m ) => {
    if ( m < 5 ) { return 5 }
    else if ( m > 100 ) { return 100 }
    else { return m }
}
const Mass = ({ x, y, mass, velocity }) => {
    if ( !x || !y || !mass ) { throw new Error('Error creating mass, incorrect args') }
    const state = {
        position : {
            x: x,
            y: y,
        },
        velocity: velocity,
        radius: getRadiusFromMass(mass),
        id: shortid.generate(),
        mass: mass,
        type: 'mass',
        color: color,
        drawCount: rest.drawCount || 0,
        display : {
            id : false,
            mass : true,
        }
    }
    const logic = {}

    logic.draw = ({ transforms }) => {
  
    }




    return Object.assign(state, logic)
}

export { Mass as default }

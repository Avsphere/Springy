

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const totalColors = [
    "#673AB7", "#009688", "#ff6922", "#2196F3", "#4CAF50", "#F44336", "#F49B3B",
    "#3F51B5", "#E91E63", "#607D8B", "#9C27B0", "#CDDC39", "#00BCD4",
];
let hasInitialized = false
let canvasCenter;
let metadata;

//refactor this
const init = ({ state, weight, systemCenter }) => {
    const {  canvas } = state;
    canvasCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }
    hasInitialized = true
}

const draw = ({state, weight, systemCenter }) => {
    if (hasInitialized === false) { init({ state, weight, systemCenter }); }
    const { displayFlags, ctx, canvas } = state;

    const shift = { x : canvasCenter.x - systemCenter.x, y : canvasCenter.y - systemCenter.y }

    

    const drawAt = {
        x : weight.position.x + shift.x,
        y : weight.position.y + shift.y
    }

    const { maxVelocity, minVelocity, avgVelocity } = weight.systemData.metadata

    ctx.strokeStyle = weight.color;
    ctx.beginPath();
    ctx.arc(drawAt.x, drawAt.y, weight.radius, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.stroke();
    
    const fillOpacity = (Math.abs(weight.velocity.x) + Math.abs(weight.velocity.y) ) /  ( maxVelocity.x + maxVelocity.y + 1 )
    ctx.fillStyle = updateOpacity(weight.color, fillOpacity)
    ctx.fill();
    

}



export { draw }
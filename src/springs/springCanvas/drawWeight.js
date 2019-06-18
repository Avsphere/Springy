

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

let hasInitialized = false
let canvasCenter;

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
    const { displayFlags, ctx, canvas, transforms, camera } = state;
    const { shift } = transforms

    const drawAt = {
        x: weight.position.x + shift.x,
        y: weight.position.y + shift.y
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

    if (displayFlags.showWeightIds) {
        const fontSize = 12
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "#000000";
        ctx.fillText(weight.id, drawAt.x - weight.radius / 2, drawAt.y - weight.radius * 1.1)
    }
    

}



export { draw }
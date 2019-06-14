

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const totalColors = [
    "#673AB7", "#009688", "#ff6922", "#2196F3", "#4CAF50", "#F44336", "#F49B3B",
    "#3F51B5", "#E91E63", "#607D8B", "#9C27B0", "#CDDC39", "#00BCD4",
];



const draw = ({state, weight, systemCenter }) => {
    const { displayFlags, ctx, canvas } = state;

    const canvasCenter = {
        x : canvas.width / 2,
        y : canvas.height /2
    }

    const shift = { x : canvasCenter.x - systemCenter.x, y : canvasCenter.y - systemCenter.y }

    const radius = weight.mass < 5 ? 5 : weight.mass > 100 ? 100 : weight.mass

    const drawAt = {
        x : weight.position.x + shift.x,
        y : weight.position.y + shift.y
    }

    ctx.strokeStyle = weight.color;
    ctx.beginPath();
    ctx.arc(drawAt.x, drawAt.y, radius, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.stroke();
    

}



export { draw }
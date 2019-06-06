

const updateOpacity = (rgb, opacity) => {
    const aux = rgb.split(',').splice(0, 3)
    aux.push(`${opacity})`)
    return aux.join(',')
}

const totalColors = [
    "#673AB7", "#009688", "#ff6922", "#2196F3", "#4CAF50", "#F44336", "#F49B3B",
    "#3F51B5", "#E91E63", "#607D8B", "#9C27B0", "#CDDC39", "#00BCD4",
];

const getRadiusFromMass = (m) => {
    if (m < 5) { return 5 }
    else if (m > 100) { return 100 }
    else { return m }
}


const drawWeight = ({state, weight, transforms }) => {
    const { displayFlags, ctx, canvas } = state;
    const { shift, scale } = transforms;

    const radius = getRadiusFromMass(weight);

    const drawAt = {
        x : weight.x + shift.x,
        y : weight.y + shift.y
    }

    ctx.strokeStyle = weight.color;

    ctx.beginPath();
    ctx.arc(drawAt.x, drawAt.y, radius, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.stroke();
    


}



export { drawWeight as default }
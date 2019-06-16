

//where state is the parent springCanvas state
const draw = ({state, spring, systemCenter }) => {
    const { displayFlags, ctx, canvas } = state;
    const canvasCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }
    // const shift = { x: canvasCenter.x - systemCenter.x, y: canvasCenter.y - systemCenter.y }

    const currentLength = spring.getLength();
    const opacity = .2 + Math.abs(1 - currentLength / spring.restingLength); //for switch handle, perhaps change?
    let strokeStyle = currentLength < spring.restingLength
        ? `rgba(0, 0, 255, ${opacity})`
        : `rgba(255, 0, 0, ${opacity})`

    if (currentLength === state.length) {
        strokeStyle = 'black'
    }

    let lineWidth_temp = ctx.lineWidth;
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = state.k;
    // ctx.moveTo(spring.weights[0].position.x + shift.x, spring.weights[0].position.y + shift.y);
    // ctx.lineTo(spring.weights[1].position.x + shift.x, spring.weights[1].position.y + shift.y);
    ctx.moveTo(spring.weights[0].position.x + 0, spring.weights[0].position.y + 0);
    ctx.lineTo(spring.weights[1].position.x + 0, spring.weights[1].position.y + 0);
    ctx.stroke();
    ctx.lineWidth = lineWidth_temp;
}



export { draw }
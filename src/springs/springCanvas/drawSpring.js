

const drawSpring = ({state, spring, transforms }) => {
    const { displayFlags, ctx, canvas } = state;
    const { shift, scale } = transforms;

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
    ctx.moveTo(spring.weights[0].position.x, spring.weights[0].position.y);
    ctx.lineTo(spring.weights[1].position.x, spring.weights[1].position.y);
    ctx.stroke();
    ctx.lineWidth = lineWidth_temp;
}



export { drawSpring as default }
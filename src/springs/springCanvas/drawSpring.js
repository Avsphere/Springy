const ID_LENGTH = 4

const trimId = (id) => id.substr(0, 4)

//where state is the parent springCanvas state
const draw = ({state, spring, systemCenter }) => {
    const { displayFlags, ctx, canvas, transforms } = state;
    const { shift } = transforms

    const drawAt = {
        x0: spring.weights[0].position.x + shift.x,
        y0: spring.weights[0].position.y + shift.y,
        x1: spring.weights[1].position.x + shift.x,
        y1: spring.weights[1].position.y + shift.y,
    }


    const currentLength = spring.getLength();
    const opacity = .2 + Math.abs(1 - currentLength / spring.restingLength); //for switch handle, perhaps change?
    let strokeStyle = currentLength < spring.restingLength
        ? `rgba(0, 0, 255, ${opacity})`
        : `rgba(255, 0, 0, ${opacity})`

    if (currentLength === state.length) {
        strokeStyle = 'black'
    }

    ctx.font = `12px Arial`;
    if ( displayFlags.showSpringIds ) {
        ctx.fillText(trimId(spring.id), (drawAt.x0 + drawAt.x1) / 2, (drawAt.y0 + drawAt.y1) / 2 + 15)
    }

    if (displayFlags.showSpringDetails) {
        ctx.fillText(spring.k, (drawAt.x0 + drawAt.x1) / 2, (drawAt.y0 + drawAt.y1) / 2 - 15)
    }


    let lineWidth_temp = ctx.lineWidth;
    ctx.lineWidth = spring.k*spring.displayScalar;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(drawAt.x0, drawAt.y0);
    ctx.lineTo(drawAt.x1, drawAt.y1);
    ctx.stroke();
    ctx.lineWidth = lineWidth_temp;
}



export { draw }
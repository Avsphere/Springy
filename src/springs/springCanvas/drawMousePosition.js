
const state = {
    axis: {
        width: 1
    },
    lineSpacing: 50, //px
    lineCount: 20
}

const draw = ({ springCanvasState, systemCenter }) => {
    const { lastMousePosition, ctx, canvas } = springCanvasState; //recall that lastMousePosition is set in listenAndHandle
    const { exact } = lastMousePosition
    //needs to be drawn at true center + shift
    const canvasCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }
    ctx.font = `11px Arial`;
    ctx.fillStyle = "#000000";
    const relative = { x: systemCenter.x - (canvasCenter.x - exact.x), y: systemCenter.y - (canvasCenter.y - exact.y) }
    ctx.fillText(`(${relative.x.toFixed(2)}, ${relative.y.toFixed(2)})`, exact.x - 25, exact.y - 10)
}



export { draw }
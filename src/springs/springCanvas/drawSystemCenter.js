
const state = {
    axis: {
        width: 1
    },
    lineSpacing: 50, //px
    lineCount: 20
}

const draw = ({ springCanvasState, systemCenter }) => {
    const { displayFlags, ctx, canvas } = springCanvasState;

    //needs to be drawn at true center + shift
    const canvasCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.beginPath();
    ctx.arc(canvasCenter.x, canvasCenter.y, 2, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.stroke();
    ctx.font = `13px Arial`;
    ctx.fillStyle = "#000000";
    //it displays the true center
    ctx.fillText(`Center : (${systemCenter.x.toFixed(2)}, ${systemCenter.y.toFixed(2)})`, canvasCenter.x, canvasCenter.y - 10)
}



export { draw }
const logic = {}

const state = {
    axis : {
        width : 1
    },
    lineSpacing : 50, //px
    lineCount : 20
}

logic.draw = ({ springCanvasState, systemCenter }) => {
    const { displayFlags, ctx, canvas } = springCanvasState;
    const canvasCenter = { x: canvas.width / 2, y : canvas.height / 2 }
    const lineSpacing = { x : canvas.width / state.lineCount, y : canvas.height / state.lineCount }
    ctx.lineWidth = state.axis.width

    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

    
    ctx.beginPath();
    ctx.arc(lineSpacing.x * state.lineCount/2, canvas.height / 2, 2, 0, Math.PI * 2, true)
    ctx.closePath();
    ctx.stroke();
    // ctx.font = `13px Arial`;
    // ctx.fillStyle = "#000000";
    // ctx.fillText(`(${systemCenter.x.toFixed(2)}, ${systemCenter.y.toFixed(2)})`, canvasCenter.x, canvasCenter.y - 10)

    ctx.strokeStyle = 'rgba(0, 0, 0, .3)';
    for ( let i = 1; i < state.lineCount; i++ ) {
        ctx.beginPath();
        ctx.moveTo(lineSpacing.x*i, 0)
        ctx.lineTo(lineSpacing.x*i, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, lineSpacing.y * i)
        ctx.lineTo(canvas.width, lineSpacing.y * i);
        ctx.stroke();
    }

}



export { logic as default }
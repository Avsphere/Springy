const logic = {}

const state = {
    axis : {
        width : 1
    },
    lineSpacing : 50, //px
    lineCount : 20
}

logic.draw = ({ springCanvasState, systemCenter }) => {
    const { displayFlags, ctx, canvas, transforms } = springCanvasState;
    const canvasCenter = { x: canvas.width / 2, y : canvas.height / 2 }
    const lineSpacing = { x : canvas.width / state.lineCount, y : canvas.height / state.lineCount }
    const { shift } = transforms

    ctx.lineWidth = state.axis.width

    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

    
    // ctx.beginPath();
    // ctx.arc(lineSpacing.x * state.lineCount/2, canvas.height / 2, 2, 0, Math.PI * 2, true)
    // ctx.closePath();
    // ctx.stroke();
    ctx.font = `13px Arial`;
    ctx.fillStyle = "#000000";
    const minRelativeX = (0 - shift.x).toFixed(1);
    const drawAt = {
        x : 0,
        y: canvasCenter.y - 10
    }
    ctx.fillText(`[${minRelativeX}, ${drawAt.y}]`, drawAt.x, drawAt.y)

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
import $ from 'jquery';
import shortid from 'shortid';

const logic = {}

logic.draw = {}

logic.mousePosition = (ev) => ({
    x: ev.clientX - canvas.getBoundingClientRect().left,
    y: ev.clientY - canvas.getBoundingClientRect().top,
})

logic.eucDist = (v1, v2) => {
    const a = v1.x - v2.x
    const b = v1.y - v2.y
    return Math.sqrt(a * a + b * b);
}

logic.filterForNear = ({ x, y }, objs, threshhold = 100) => objs
    .filter(o => Math.abs(o.x - x) < threshhold && Math.abs(o.y - y))


logic.sortObjects = (objs, sortBy = 'x') => objs.sort((a, b) => a[sortBy] - b[sortBy])



logic.findNearestObj = ({ x, y }, objs) => {
    const v1 = { x: x, y: y }
    return objs.reduce((acc, o) => {
        const dist = eucDist(v1, o);
        if (dist < acc.dist) {
            acc.dist = dist;
            acc.nearest = o;
        }
        return acc;
    }, { dist: Infinity, nearest: {} })
}

logic.draw.roundRect = ({ x, y, w, h, radius }) => {
  const r = x + w;
  const b = y + h;

  ctx.beginPath();
  ctx.strokeStyle="green";
  ctx.moveTo(x+radius, y);
  ctx.lineTo(r-radius, y);
  ctx.quadraticCurveTo(r, y, r, y+radius);
  ctx.lineTo(r, y+h-radius);
  ctx.quadraticCurveTo(r, b, r-radius, b);
  ctx.lineTo(x+radius, b);
  ctx.quadraticCurveTo(x, b, x, b-radius);
  ctx.lineTo(x, y+radius);
  ctx.quadraticCurveTo(x, y, x+radius, y);
  ctx.stroke();

}


logic.randomInt = (n) => Math.floor( Math.random() * n )

const totalColors = [
    "#673AB7", "#009688", "#ff6922", "#2196F3", "#4CAF50", "#F44336", "#FFEB3B",
    "#3F51B5", "#E91E63", "#607D8B", "#9C27B0", "#CDDC39", "#00BCD4", "#FFC107",
];
logic.randomColor = () => totalColors[ randomInt(totalColors.length) ]


export { logic as default }

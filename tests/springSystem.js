const odex = require('odex')


const solver = new odex.Solver(4); //4 independent vars


const springSystem = ({ m1, m2, k1, k2, l1, l2 }) => ( t, [x1, y1, x2, y2]) => [
  y1,
  ( -k1*(x1 - l1) + k2*(x2 - x1 - l2) )/m1,
  y2,
  -k2*(x2 - x1 -l2)/m2
]


const constants = {
  m1 : 1,
  m2 : 1,
  k1 : .1,
  k2 : .1,
  l1 : 10,
  l2 : 10
}

const ic = {
  x1 : 10 + 10, //displacement
  y1 : 0, //velocity
  x2 : 20 + 10,
  y2 : 0
}

const initialConditions = [ic.x1, ic.y1, ic.x2, ic.y2]

const output = []



solver.denseOutput = true;
const result = solver.solve(springSystem(constants), 0, initialConditions, 100, solver.grid(0.1, (t, [x1, a1, x2, a2]) => {
    output.push([t, { x1 : x1, x2 : x2 }] )
  })
)

// solver.denseOutput = true;
// const result = solver.solve(springSystem(constants), 0, initialConditions, 1, (n, ...args) => {
//   console.log(n, args)
// })

console.log(result)

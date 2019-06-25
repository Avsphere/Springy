const odex = require('odex')


const solver = new odex.Solver(4); //4 independent vars to represent our 2 second order equations

//i.e wall --- s1 --- w1 --- s2 --- w2
const springSystem = ({ m1, m2, k1, k2, l1, l2 }) => ( t, [x1, y1, x2, y2]) => [
  y1,
  (-k1 * (x1 - l1) + k2 * (x2 - x1 - l2)) / m1, //i.e -k1*(x1 - l1) is the stretch of the left most spring
  y2,
  -k2 * (x2 - x1 - l2) / m2 //
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
  x1 : 10 + 10, //displacement of first weight
  y1 : 0, //velocity of first weight
  x2 : 20 + 10,
  y2 : 0
}

const initialConditions = [ic.x1, ic.y1, ic.x2, ic.y2]

solver.denseOutput = true;
const result = solver.solve(springSystem(constants), 0, initialConditions, 100, solver.grid(0.1, (t, [x1, a1, x2, a2]) => {
  console.log(`At t : ${t} weight1 displacement = ${x1}; weight1 acceleration = ${a1}`)
  console.log(`At t : ${t} weight2 displacement = ${x2}; weight2 acceleration = ${a2}`)
  })
)


// const odex = require('odex')
// const solver = new odex.Solver(2); //2 independent vars

// const springSystem = ({ m1, k1, l1 }) => (t, [x1, v1]) => [
//   v1,
//   (-k1 * (x1 - l1) ) / m1
// ]


// const constants = {
//   m1: 1, //weight mass
//   k1: .1, //spring K
//   l1: 10, //resting length of spring
// }

// const ic = {
//   x1: 10 + 10, //restingLength + displacement
//   v1: 0, //velocity
// }
// const initialConditions = [ic.x1, ic.v1]


// const stepSize = 0.1;
// const maxTime = 10;
// solver.denseOutput = true;
// const result = solver.solve(
//   springSystem(constants), //building closure 
//   0, //starting time
//   initialConditions, 
//   maxTime, 
//   solver.grid(stepSize, (t, [x1, a1]) => {
//     console.log(`At t : ${t} weight displacement = ${x1}; weight acceleration = ${a1}`)
//   })
)
const odex = require('odex')


const solver = new odex.Solver(2); //two independent vars

/*

Original diff eq :
dx/dt = ax - bxy
dy/dt = cxy - dy


*/

//t is the step, generally others seem to refer to as x in the odex solver
const predatorPrey = ({a, b, c, d}) => (t, [x, y]) => {
  return [
    a*x - b*x*y,
    c*x*y - d*y
  ]
}



const constants = { a : 2/3, b : 4/3, c : 1, d : 1 }

const result = solver.solve(predatorPrey(constants), 0, [1, 1], 6)

console.log(result)

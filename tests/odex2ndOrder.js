const odex = require('odex')


const solver = new odex.Solver(2); //two independent vars

/*

Original diff eq :
y'' - xy = 0

setting y0 = y, y1 = y'

The new system is then
let y0 = y1
let y1' -x*y0 = 0




*/


const airy = (t, [y0, y1]) => [ y1, t*y0 ]

// const result = solver.solve(airy, 0, [1, 1], 6)


//given y'' + 5y' + 6y = 0
const example2ndOrder = (t, [y0, y1]) => [ y1, -5*y1 - 6*y0 ]

const result = solver.solve(example2ndOrder, 0, [2, 3], 3)

console.log(result)

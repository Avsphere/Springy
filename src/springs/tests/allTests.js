import graphTests from './graph'
import solverTests from './solverBasics'
import springAndWeightTests from './springAndWeight'

const allTests = {}

allTests.graph = graphTests;
allTests.solverTests = solverTests;
allTests.springAndWeightTests = springAndWeightTests;


export { allTests as default }
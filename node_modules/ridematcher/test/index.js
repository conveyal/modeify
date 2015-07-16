/* global describe, it */

import {findMatches, findRidepoolMatches} from '../build'

describe('ridematcher.js', () => {
  it('findMatches', (done) => {
    findMatches(getCommuters(1000), {
      radius: 0.5
    }).then((response) => {
      done()
    }, done)
  })
})

describe('ridematcher.js', () => {
  it('findRidepoolMatches', (done) => {
    findRidepoolMatches([-77.32649, 38.67792], [-76.9382, 38.9798], getRidepools(10000), {
      radius: 1.5
    }).then((response) => {
      done()
    }, done)
  })
})

// generate random commuters
function getCommuters (numCommuters) {
  const bottom = 38.77792
  const left = -77.082649
  const top = 38.8798
  const right = -76.9882
  numCommuters = numCommuters || 100

  const commuters = []
  for (let i = 0; i < numCommuters; i++) {
    commuters.push({
      _id: i + 1,
      from: [left + Math.random() * (right - left), bottom + Math.random() * (top - bottom)]
    })
  }

  return commuters
}

// generate random vanpools
function getRidepools (numPools) {
  const bottom = 38.67792
  const left = -77.32649
  const top = 38.9798
  const right = -76.9382
  numPools = numPools || 100

  const pools = []
  for (let i = 0; i < numPools; i++) {
    pools.push({
      _id: i + 1,
      from: [left + Math.random() * (right - left), bottom + Math.random() * (top - bottom)],
      to: [left + Math.random() * (right - left), bottom + Math.random() * (top - bottom)]
    })
  }

  return pools
}

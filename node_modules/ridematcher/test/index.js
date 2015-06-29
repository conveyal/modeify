/* global describe, it */

import {findMatches} from '../'

describe('ridematcher.js', () => {
  it('findMatches', (done) => {
    findMatches(getCommuters(1000), {
      radius: 0.5
    }).then((response) => {
      console.log(response)
      done()
    }, done)
  })
})

// generate random commuters
function getCommuters (numCommuters) {
  const bottom = 38.67792, left = -77.32649, top = 38.9798, right = -76.9382
  numCommuters = numCommuters || 100

  const commuters = []
  for (let i = 0; i < numCommuters; i++) {
    commuters.push({
      _id: i + 1,
      coordinates: [left + Math.random() * (right - left), bottom + Math.random() * (top - bottom)]
    })
  }

  return commuters
}

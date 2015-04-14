/* global describe, it */

import {findMatches} from '../'

describe('commuter-connections.js', () => {
  it('findMatches', (done) => {
    findMatches({
      startLat: 39.0436,
      startLng: -77.4875,
      endLat: 38.9047,
      endLng: -77.0164,
      startRadius: 2,
      endRadius: 2
    }).then((response) => {
      done()
    }, done)
  })
})

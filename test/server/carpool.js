/* global describe, it */

import supertest from './supertest'

describe('/api/carpool', () => {
  describe('/external-matches', () => {
    it('should find external matches', (done) => {
      supertest
        .get('/api/carpool/external-matches')
        .query({
          from: '-77.4875,39.0436',
          to: '-77.0164,38.9047'
        })
        .expect(200, done)
    })
  })
})

/* globals describe, expect, it */

process.env.TEST_R5_URL = 'http://mock-host.com'

import nock from 'nock'

const r5 = require('../../lib/r5')

describe('r5', () => {
  it('should request plan', async () => {
    nock('http://mock-host.com')
      .post('/')
      .reply(200, (uri, requestBody) => {
        expect(uri).toBe('/')
        expect(requestBody.query).toMatchSnapshot()
        expect(JSON.parse(requestBody.variables)).toMatchSnapshot()
        return {
          data: {
            plan: {
              fake: 'response'
            }
          }
        }
      })

    const response = await r5.requestPlan({
      from: {
        lon: -77.029199,
        lat: 38.943037
      },
      to: {
        lon: -77.085016,
        lat: 38.891254
      },
      date: '2016-06-17',
      fromTime: '7:00',
      toTime: '9:00',
      accessModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR_PARK',
      directModes: 'CAR,WALK,BICYCLE,BICYCLE_RENT',
      egressModes: 'WALK',
      transitModes: 'RAIL,SUBWAY,TRAM' //TL 06/06/2017 Trainish n'existe plus
    })

    delete response.responseTime
    expect(response).toMatchSnapshot()
  })
})

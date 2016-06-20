const assert = require('assert')

const r5 = require('../../lib/r5')

r5.requestPlan({
  from: {
    lng: -77.029199,
    lat: 38.943037
  },
  to: {
    lng: -77.085016,
    lat: 38.891254
  },
  date: '2016-06-17',
  fromTime: '7:00',
  toTime: '9:00',
  accessModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR_PARK',
  directModes: 'CAR,WALK,BICYCLE,BICYCLE_RENT',
  egressModes: 'WALK',
  transitModes: 'TRAINISH'
}).then((data) => {
  console.log('Options:', data.options.length)
  console.log('Response Time:', data.responseTime / 1000, 'seconds')
}).catch((err) => {
  console.error(err)
  assert(!err, 'Should not fail.')
})

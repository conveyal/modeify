var names = require('names')
require('seedrandom')

var modes = [ 'metro', 'bus', 'bike', 'walk', 'drive' ]
var commuters = []
var latMin = 38.85
var latMultiple = 0.20
var lonMin = -77.30
var lonMultiple = 0.4

Math.seedrandom('modeify')
for (var i = 0; i < 100; i++) {
  commuters.push({
    name: names(),
    mode: modes[Math.floor(Math.random() * modes.length)],
    coords: [ lonMin + (Math.random() * lonMultiple), latMin + (Math.random() * latMultiple) ],
    time: Math.ceil((Math.random() * 45) + 15),
    calories: Math.ceil(Math.random() * 100),
    cost: ((Math.random() * 10) + 1).toFixed(2),
    matches: Math.floor(Math.random() * 5),
    status: ['Matched', 'Profiled', 'Sent'][Math.floor(Math.random() * 3)]
  })
}

module.exports = commuters

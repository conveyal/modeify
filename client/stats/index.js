var MemoryStats = require('./memory-stats')
var raf = require('raf')
var Stats = require('./stats')

var stats = module.exports = new Stats()
var memory = module.exports.memory = new MemoryStats()

memory.domElement.style.position = 'fixed'
memory.domElement.style.left = '0px'
memory.domElement.style.bottom = '0px'

stats.domElement.style.position = 'fixed'
stats.domElement.style.left = '80px'
stats.domElement.style.bottom = '0px'

document.body.appendChild(memory.domElement)
document.body.appendChild(stats.domElement)

raf(function rAFloop () {
  // By default measure between animation frames
  stats.update()
  memory.update()
  raf(rAFloop)
})

module.exports.show = function () {
  memory.domElement.style.display = 'block'
  stats.domElement.style.display = 'block'
}

module.exports.hide = function () {
  memory.domElement.style.display = 'none'
  stats.domElement.style.display = 'none'
}

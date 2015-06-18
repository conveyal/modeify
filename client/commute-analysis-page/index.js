var dc = require('dc.js')
var d3 = require('d3')
var crossfilter = require('crossfilter').crossfilter
var log = require('log')('commute-analysis-page')
var map = require('map')
var names = require('names')
require('seedrandom')
var view = require('view')

var modes = [ 'metro', 'bus', 'bike', 'walk', 'drive' ]
var commuters = []
var latMin = 38.85, latMultiple = 0.20
var lonMin = -77.30, lonMultiple = 0.4

Math.seedrandom('modeify')
for (var i = 0; i < 100; i++) {
  commuters.push({
    name: names(),
    mode: modes[Math.floor(Math.random() * modes.length)],
    coords: [ lonMin + Math.random() * lonMultiple, latMin + Math.random() * latMultiple ],
    time: Math.ceil(Math.random() * 45 + 15),
    calories: Math.ceil(Math.random() * 100),
    cost: (Math.random() * 10 + 1).toFixed(2),
    matches: Math.floor(Math.random() * 5)
  })
}

var View = view(require('./template.html'), function (view, model) {
  view.on('rendered', function () {
    var m = map(view.find('.map'), {
      center: model.coordinate(),
      zoom: 13
    })

    var c = model.coordinate()

    m.addMarker(map.createMarker({
      color: '#428bca',
      coordinate: [c.lng, c.lat],
      icon: 'commercial'
    }))

    var cluster = new window.L.MarkerClusterGroup()
    commuters.forEach(function (commuter) {
      cluster.addLayer(map.createMarker({
        color: '#5cb85c',
        coordinate: commuter.coords,
        icon: 'building',
        size: 'small'
      }))
    })

    m.addLayer(cluster)
    m.fitLayers([m.featureLayer, cluster])

    var ndx = crossfilter(commuters)
    var bar = dc.barChart('.time-bar-chart')
    var pie = dc.pieChart('.mode-split-pie-chart')
    var table = dc.dataTable('.commuter-data-table')

    var modeDimension = ndx.dimension(function (d) { return d.mode })
    var timeD = ndx.dimension(function (d) { return d.time })
    var nameD = ndx.dimension(function (d) { return d.name })

    pie
      .width(160)
      .height(160)
      .dimension(modeDimension)
      .group(modeDimension.group())

    bar
      .width(320)
      .height(190)
      .brushOn(false)
      .title(function (d) { return 'Commute Times' })
      .x(d3.scale.linear().domain([15, 60]))
      .dimension(timeD)
      .group(timeD.group(function (t) { return t }))

    table
      .dimension(nameD)
      .group(function (d) { return true })
      .columns([
        'name',
        'mode',
        'time',
        'cost',
        'calories',
        'matches'
      ])
      .size(100)
      .sortBy(function (d) {
        return d.name
      })

    pie.render()
    bar.render()
    table.render()
  })
})

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View(ctx.location)
  next()
}

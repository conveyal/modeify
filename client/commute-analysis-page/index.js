var dc = require('dc.js')
var d3 = require('d3')
var commuters = require('fake-commuters')
var crossfilter = require('crossfilter').crossfilter
var log = require('log')('commute-analysis-page')
var map = require('map')
var view = require('view')

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
      .width(400)
      .height(190)
      .brushOn(false)
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

var crossfilter = require('crossfilter2')
var dc = require('dc')
var d3 = require('d3')
var L = require('leaflet')

require('leaflet.markercluster')

var alerts = require('../alerts')
var haversine = require('../components/trevorgerhardt/haversine/master')
var log = require('../log')('commute-analysis-page')
var map = require('../map')
var ProfileScorer = require('otp-profile-score')
var view = require('../view')

module.exports = function (ctx, next) {
  log('render')

  var cls = ctx.location.commuterLocations = ctx.commuterLocations

  if (cls.length > haveProfileOptions(cls)) {
    alerts.show({
      type: 'warning',
      text: 'Not all commuter locations have been profiled. Run Profile & Match from the location page to see the full results.'
    })
  }

  ctx.view = new View(ctx.location)
  ctx.view.on('rendered', function (view) {
    var m = map(view.find('.map'), {
      center: ctx.location.coordinate(),
      zoom: 13
    })
    m.addLayer(ctx.location.mapMarker())

    if (ctx.location.commuterLocations.length > 0) {
      var cluster = new L.MarkerClusterGroup()
      ctx.location.commuterLocations.forEach(function (cl) {
        if (cl._commuter.validCoordinate()) cluster.addLayer(cl._commuter.mapMarker())
      })

      if (cluster.getBounds()._northEast) {
        m.addLayer(cluster)
      }
    }
  })

  next()
}

var View = view(require('./template.html'), function (view, model) {
  var scorer = new ProfileScorer()

  view.on('rendered', function () {
    try {
      var profiles = model.commuterLocations
        .filter(function (cl) {
          return cl.profile && cl.profile.options
        })
        .map(function (cl) {
          return {
            cl: cl,
            processedOptions: scorer.processOptions(cl.profile.options)
          }
        })
        .filter(function (clpo) {
          return clpo.processedOptions && clpo.processedOptions.length > 0
        })
        .map(function (clpo) {
          var cl = clpo.cl
          var profile = clpo.processedOptions[0]
          var matches = cl.matches || []
          var to = cl._location.coordinate()
          var from = cl._commuter.coordinate()
          var commuter = (cl._commuter.givenName() && cl._commuter.surname()) ? cl._commuter.givenName() + ' ' + cl._commuter.surname() : cl._commuter.email() || 'Unnamed Commuter'
          if (cl._commuter.internalId()) commuter += ` (${cl._commuter.internalId()})`
          return {
            commuter: commuter,
            calories: parseInt(profile.calories, 10),
            cost: profile.cost.toFixed(2),
            distance: parseFloat(haversine(from.lat, from.lng, to.lat, to.lng, false).toFixed(2)),
            mode: profile.modes.join(', '),
            score: profile.score,
            time: parseInt(profile.time / 60, 10),
            matches: matches.length
          }
        })

      var ndx = crossfilter(profiles)

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
        .x(d3.scale.linear().domain([0, 60]))
        .dimension(timeD)
        .group(timeD.group(function (t) { return t }))

      table
        .dimension(nameD)
        .group(function (d) { return true })
        .columns([
          'commuter',
          'mode',
          'time',
          'distance',
          'cost',
          'calories',
          'matches'
        ])
        .size(100)
        .sortBy(function (d) {
          return d.score
        })

      pie.render()
      bar.render()
      table.render()

      var $costAvg = view.find('#costAverage')
      var $costPYAvg = view.find('#costPerYearAverage')
      var $timeAvg = view.find('#timeAverage')
      var $distanceAvg = view.find('#distanceAverage')

      var costAvg = profiles.reduce(function (total, p) {
        return total + parseFloat(p.cost)
      }, 0) / profiles.length
      var distAvg = profiles.reduce(function (total, p) {
        return total + p.distance
      }, 0) / profiles.length
      var timeAvg = profiles.reduce(function (total, p) {
        return total + p.time
      }, 0) / profiles.length

      $costAvg.textContent = '$' + costAvg.toFixed(2)
      $costPYAvg.textContent = '$' + parseInt(costAvg * 470, 10)
      $timeAvg.textContent = parseInt(timeAvg, 10) + ' min'
      $distanceAvg.textContent = distAvg.toFixed(2) + ' mi'
    } catch (err) {
      console.log('Error generating commute analysis', err)
    }
  })
})

function haveProfileOptions (commuterLocations) {
  return commuterLocations.filter(function (cl) {
    return cl.profile && cl.profile.options
  })
}

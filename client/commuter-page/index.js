var alerts = require('../alerts')
var config = require('../config')
var debug = require('debug')(config.name() + ':commuter-page')
var map = require('../map')
var page = require('page')
var request = require('../request')
var template = require('./template.html')
var view = require('../view')

var CommuterLocation = require('../commuter-location')

/**
 * Create `View`
 */

var View = view(template)

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  debug('render')
  if (ctx.params.commuter === 'new' || !ctx.commuter) return

  CommuterLocation.forCommuter(ctx.commuter.get('_id'), function (err, commuterLocations) {
    if (err) {
      console.error(err)
    }

    commuterLocations = commuterLocations.map(function (cl) {
      return {
        organizationId: cl._location.get('created_by'),
        locationId: cl._location.get('_id'),
        name: cl._location.get('name'),
        fullAddress: cl._location.get('address') + ', ' + cl._location.get('city') + ', ' + cl._location.get('state'),
        matches: cl.matches
      }
    })

    ctx.view = new View(ctx.commuter, {
      organization: ctx.organization,
      commuterLocations: commuterLocations
    })
    ctx.view.on('rendered', function (view) {
      if (ctx.commuter.validCoordinate()) {
        var m = window.map = map(view.find('.map'), {
          center: ctx.commuter.coordinate(),
          zoom: 13
        })

        m.addMarker(ctx.commuter.mapMarker())
      // TODO: add organization location marker(s)
      // m.fitLayer(m.featureLayer)
      }
    })

    next()
  })
}

/**
 * Destroy
 */

View.prototype.destroy = function (e) {
  e.preventDefault()
  if (window.confirm('Delete commuter?')) { // eslint-disable-line no-alert
    var url = '/manager/organizations/' + this.model._organization() + '/show'
    this.model.destroy(function (err) {
      if (err) {
        debug(err)
        window.alert(err) // eslint-disable-line no-alert
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted commuter.'
        })
        page(url)
      }
    })
  }
}

/**
 * Send
 */

View.prototype.sendPlan = function (e) {
  e.preventDefault()
  if (window.confirm('Resend invitation to commuter?')) { // eslint-disable-line no-alert
    request.post('/commuters/' + this.model._id() + '/send-plan', {}, function (
      err, res) {
      if (err || !res.ok) {
        debug(err, res)
        window.alert('Failed to send plan.') // eslint-disable-line no-alert
      } else {
        alerts.show({
          type: 'success',
          text: 'Emailed plan to commuter.'
        })
      }
    })
  }
}

View.prototype.commuterName = function () {
  if (!this.model.givenName() && !this.model.surname()) return '(Unnamed Commuter)'
  return this.model.givenName() + ' ' + this.model.surname()
}

View.prototype.internalId = function () {
  return this.model.internalId() || '(none)'
}

View.prototype.organizationName = function () {
  return this.options.organization.name()
}

View.prototype.commuterLocations = function () {
  return this.options.commuterLocations
}

var Match = view(require('./match.html'))

Match.prototype.distanceMi = function () {
  return Math.round(this.model.distance * 100) / 100
}

Match.prototype.commuterName = function () {
  if (!this.model.givenName && !this.model.surname) return '(Unnamed Commuter)'
  return this.model.givenName + ' ' + this.model.surname
}

var LocationRow = view(require('./location.html'))

LocationRow.prototype['matches-view'] = function () {
  return Match
}

View.prototype['commuterLocations-view'] = function () {
  return LocationRow
}

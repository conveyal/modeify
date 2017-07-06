var analytics = require('../analytics')
var closest = require('component-closest')
var log = require('../log')('locations-view')
var textModal = require('../text-modal')
var view = require('../view')
var LocationSuggest = require('../location-suggest')
var extend = require('../components/segmentio/extend/1.0.0')
var session = require('../session')
var _tr = require('../translate')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, plan) {
  _tr.attribute(view, 'input', 'placeholder')
  plan.on('change', function (name) {
    view.resetIcons()

    if (name === 'from') view.find('#from-location').value = plan.from()
    if (name === 'to') view.find('#to-location').value = plan.to()

    if (session.user() && (name === 'from' || name === 'to')) {
      view.checkAddressFavorite(name)
    }
  })

  view.on('rendered', function () {
    // Reset the icons
    view.resetIcons()

    // Set the initial state of the favorite icons
    if (session.user()) {
      view.checkAddressFavorite('from')
      view.checkAddressFavorite('to')
    }

    // On form submission
    closest(view.el, 'form').onsubmit = function (e) {
      e.preventDefault()

      plan.setAddresses(view.find('.from input').value, view.find('.to input').value, function (err) {
        if (err) {
          log.error('%e', err)
        } else {
          plan.updateRoutes()
        }
      })
    }
  })
})

extend(View.prototype, LocationSuggest.prototype)

/**
 * Show clear or current location, but not both
 */

View.prototype.resetIcons = function (e) {
  showClearOrCurrentLocation(this, 'from')
  showClearOrCurrentLocation(this, 'to')

  function showClearOrCurrentLocation (view, name) {
    var selector = '.' + name
    var value = view.find(selector + ' input').value
    var refresh = view.find(selector + ' .findingCurrentLocation')
    var clear = view.find(selector + ' .clear')
    var location = view.find(selector + ' .currentLocation')

    refresh.classList.add('hidden')

    if (!value || !value.trim || value.trim().length === 0) {
      clear.classList.add('hidden')
      location.classList.remove('hidden')
    } else {
      clear.classList.remove('hidden')
      location.classList.add('hidden')
    }
  }
}

/**
 * Use the current location if it's available
 */

View.prototype.currentLocation = function (e) {
  e.preventDefault()
  if ('geolocation' in navigator) {
    var name = e.target.parentNode.classList.contains('from') ? 'from' : 'to'
    var input = this.find('.' + name + ' input')
    var self = this

    e.target.classList.add('hidden')
    this.find('.' + name + ' .findingCurrentLocation').classList.remove('hidden')

    navigator.geolocation.getCurrentPosition(function (position) {
      var c = position.coords
      input.value = c.longitude + ', ' + c.latitude
      self.save(input)
    }, function (err) {
      console.error(err)
      self.resetIcons()
      window.alert('Whoops! We were unable to find your current location.')
    }, {
      enableHighAccuracy: true, // use GPS if available
      maximumAge: 60000, // 60 seconds
      timeout: 30000 // 30 seconds
    })
  } else {
    window.alert('Whoops! Looks like GPS location not available on this device.')
  }
}

View.prototype.locationSelected = function (target) {
  this.save(target)
}

/**
 * Geocode && Save
 */

View.prototype.save = function (el) {
  var plan = this.model
  var name = el.name
  var val = el.value

  if (val && plan[name]() !== val) {
    analytics.track('Location Found', {
      address: val,
      type: name
    })
    this.model.setAddress(name, val, function (err, location) {
      if (err) {
        log.error('%e', err)
        textModal('Invalid address.')
      } else if (location) {
        plan.updateRoutes()
      }
    })
  }

  this.resetIcons()
}

/**
 * Highlight the selected input
 */

View.prototype.focusInput = function (e) {
  e.target.parentNode.classList.add('highlight')
}

/**
 * Clear
 */

View.prototype.clear = function (e) {
  e.preventDefault()
  var inputGroup = e.target.parentNode
  var input = inputGroup.getElementsByTagName('input')[0]
  input.value = ''
  input.focus()

  this.resetIcons()
}

View.prototype.toggleFavorite = function (e) {
  if (!session.user()) {
    // TODO: encourage user to register?
    return
  }

  var type = e.target.parentNode.classList.contains('from') ? 'from' : 'to'
  var address = this.model.get(type)

  if (e.target.classList.contains('fa-heart-o')) {
    session.user().addFavoritePlace(address)
    session.user().saveCustomData(function () {})
    this.checkAddressFavorite(type)
  }
}

View.prototype.checkAddressFavorite = function (type) {
  var el = this.find('.' + type + '-favorite')
  if (session.user().isFavoritePlace(this.model.get(type))) {
    enableFavoriteIcon(el)
    el.title = 'Added to favorite places'
  } else {
    disableFavoriteIcon(el)
    el.title = 'Add to favorite places'
  }
}

function enableFavoriteIcon (el) {
  el.classList.remove('fa-heart-o')
  el.classList.add('fa-heart')
}

function disableFavoriteIcon (el) {
  el.classList.remove('fa-heart')
  el.classList.add('fa-heart-o')
}

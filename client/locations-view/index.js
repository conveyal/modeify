var analytics = require('../analytics')
var closest = require('component-closest')
var log = require('../log')('locations-view')
var textModal = require('../text-modal')
var view = require('../view')
var LocationSuggest = require('../location-suggest')
var extend = require('../components/segmentio/extend/1.0.0')
var session = require('../session')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, plan) {
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
      view.checkAddressFavorites()
    }

    // On form submission
    closest(view.el, 'form').onsubmit = function (e) {
      e.preventDefault()

      // only reset addresses if needed
      const newFromValue = view.find('.from input').value
      const newToValue = view.find('.to input').value

      if (newFromValue !== plan.from() && newToValue !== plan.to()) {
        plan.setAddresses(newFromValue, newToValue, function (err) {
          if (err) {
            log.error('%e', err)
          } else {
            plan.updateRoutes()
          }
        })
      } else if (newFromValue !== plan.from()) {
        plan.setAddress('from', newFromValue, function (err) {
          if (err) {
            log.error('%e', err)
          } else {
            plan.updateRoutes()
          }
        })
      } else if (newToValue !== plan.to()) {
        plan.setAddress('to', newToValue, function (err) {
          if (err) {
            log.error('%e', err)
          } else {
            plan.updateRoutes()
          }
        })
      }
    }
  })

  function listenToUserForFavoriteChanges () {
    session.user().on('change user_metadata', () => {
      view.checkAddressFavorites()
    })
  }

  session.on('change isLoggedIn', () => {
    if (session.user()) {
      view.checkAddressFavorites()
      listenToUserForFavoriteChanges()
    }
  })

  if (session.user()) {
    listenToUserForFavoriteChanges()
  }
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

View.prototype.locationSelected = function (target, val, magicKey) {
  this.save(target, val, magicKey)
}

/**
 * Geocode && Save
 */

View.prototype.save = function (el, val, magicKey) {
  var plan = this.model
  var name = el.name
  val = val || el.value

  if (val && plan[name]() !== val) {
    analytics.track('Location Found', {
      address: val,
      type: name
    })
    let locationData = val
    if (magicKey) {
      locationData = {
        address: val,
        magicKey
      }
    }
    this.model.setAddress(name, locationData, function (err, location) {
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
  const gps = this.model.get(`${type}_ll`)

  if (e.target.classList.contains('fa-heart-o')) {
    session.user().addFavoritePlace({
      address,
      lat: gps.lat,
      lon: gps.lng
    })
    session.user().saveUserMetadata(function () {})
    this.checkAddressFavorite(type)
  } else {
    session.user().deleteFavoritePlace(address)
    session.user().saveUserMetadata(function () {})
    this.checkAddressFavorite(type)
  }
}

View.prototype.checkAddressFavorites = function () {
  this.checkAddressFavorite('from')
  this.checkAddressFavorite('to')
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

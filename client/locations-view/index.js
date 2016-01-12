var closest = require('closest')
var log = require('./client/log')('locations-view')
var textModal = require('text-modal')
var view = require('view')
var LocationSuggest = require('location-suggest')
var extend = require('extend')
var session = require('session')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, plan) {

  plan.on('change', function (name) {
    view.resetIcons()

    if(name === 'from') view.find('#from-location').value = plan.from()
    if(name === 'to') view.find('#to-location').value = plan.to()

    if(session.user()) {
      if(name === 'from') checkFromAddressFavorite(view, plan)
      if(name === 'to') checkToAddressFavorite(view, plan)
    }
  })

  view.on('rendered', function () {
    // Reset the icons
    view.resetIcons()

    // Set the initial state of the favorite icons
    if(session.user()) {
      checkFromAddressFavorite(view, plan)
      checkToAddressFavorite(view, plan)
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
      enableHighAccuracy: true,  // use GPS if available
      maximumAge: 60000, // 60 seconds
      timeout: 30000  // 30 seconds
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
  if(!session.user()) {
    // TODO: encourage user to register?
    return
  }
  var address, ll
  if(e.target.parentNode.classList.contains('from')) {
    address = this.model.from()
    ll = this.model.from_ll()
  }
  else {
    address = this.model.to()
    ll = this.model.to_ll()
  }

  if(e.target.classList.contains('fa-heart-o')) {
    enableFavoriteIcon(e.target)
    session.user().addFavoritePlace(address)
    session.user().saveCustomData(function () {})
  }
}

function checkFromAddressFavorite(view, plan) {
  if (session.user().isFavoritePlace(plan.from())) {
    enableFavoriteIcon(view.find('.from-favorite'))
  }
  else {
    disableFavoriteIcon(view.find('.from-favorite'))
  }
}

function checkToAddressFavorite(view, plan) {
  if (session.user().isFavoritePlace(plan.to())) {
    enableFavoriteIcon(view.find('.to-favorite'))
  }
  else {
    disableFavoriteIcon(view.find('.to-favorite'))
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
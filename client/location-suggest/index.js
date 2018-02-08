var geocode = require('../geocode')
var hogan = require('hogan.js')
var log = require('../log')('location-suggest')
var each = require('component-each')
var throttle = require('throttleit')
var session = require('../session')

module.exports = LocationSuggest

function LocationSuggest () {}

/**
 * Suggestions Template
 */

var suggestionsTemplate = hogan.compile(require('./suggestions.html'))

/**
 * Suggest
 */

LocationSuggest.prototype.suggest = throttle(function (e) {
  var input = e.target
  var text = input.value || ''
  var view = this

  // try favorite places for short searches
  if (text.length < 6 && session.user()) {
    var fpMatches = session.user().matchFavoritePlaces(text)
    var fpSuggestions = fpMatches.map(function (fpMatch) {
      return {
        text: fpMatch.address,
        isFavorite: true
      }
    })
    view.renderSuggestions(input, fpSuggestions)
    return
  }

  // If the text is too short or does not contain a space yet, return
  if (text.length < 6) return

  // Get a suggestion!
  geocode.suggest(text, function (err, suggestions) {
    if (err) {
      log.error('%e', err)
    } else {
      view.renderSuggestions(input, suggestions)
    }
  })
}, 500)

LocationSuggest.prototype.renderSuggestions = function (input, suggestions) {
  var view = this
  var inputGroup = input.parentNode
  var suggestionList = inputGroup.getElementsByTagName('ul')[0]

  if (suggestions && suggestions.length > 0) {
    suggestions = suggestions.slice(0, 4)

    suggestionList.innerHTML = suggestionsTemplate.render({
      suggestions
    })

    each(view.findAll('.suggestion'), function (li) {
      li.onmouseover = function (e) {
        li.classList.add('highlight')
      }

      li.onmouseout = function (e) {
        li.classList.remove('highlight')
      }
    })

    suggestionList.classList.remove('empty')
    inputGroup.classList.add('suggestions-open')
  } else {
    suggestionList.classList.add('empty')
    inputGroup.classList.remove('suggestions-open')
  }
}

/**
 * Address Changed
 */

LocationSuggest.prototype.blurInput = function (e) {
  log('input blurred, saving changes')

  var inputGroup = e.target.parentNode
  var suggestionList = inputGroup.getElementsByTagName('ul')[0]
  inputGroup.classList.remove('suggestions-open')

  var highlight = this.find('.suggestion.highlight')
  let magicKey
  if (highlight) {
    e.target.value = cleanText(highlight.textContent || '')
    magicKey = highlight.getAttribute('data-key')
  }

  suggestionList.classList.add('empty')

  setTimeout(function () {
    suggestionList.innerHTML = ''
  }, 250)

  inputGroup.classList.remove('highlight')

  this.locationSelected(e.target, e.target.value, magicKey)
}

/**
 * Keypress
 */

LocationSuggest.prototype.keydownInput = function (e) {
  var el = e.target
  var inputGroup = e.target.parentNode
  var key = e.keyCode

  // Currently highlighted suggestion
  var highlightedSuggestion = this.find('.suggestion.highlight')

  switch (key) {
    case 13: // enter key
      e.preventDefault()
      this.blurInput(e)
      break
    case 38: // up key
    case 40: // down key
      if (key === 38) {
        this.pressUp(highlightedSuggestion, el)
      } else {
        this.pressDown(highlightedSuggestion, el)
      }

      var newHighlight = this.find('.suggestion.highlight')
      if (newHighlight) el.value = newHighlight.textContent || ''
      break
    case 27:
      var suggestionList = inputGroup.getElementsByTagName('ul')[0]
      inputGroup.classList.remove('suggestions-open')
      suggestionList.classList.add('empty')
      setTimeout(function () {
        suggestionList.innerHTML = ''
      }, 250)
      if (session && session.plan()) e.target.value = session.plan().get(e.target.name) || ''
      else e.target.value = ''
      break
  }
}

/**
 * Press Up
 */

LocationSuggest.prototype.pressUp = function (highlightedSuggestion, el) {
  if (highlightedSuggestion) {
    var aboveHighlightedSuggestion = highlightedSuggestion.previousElementSibling

    if (aboveHighlightedSuggestion) {
      aboveHighlightedSuggestion.classList.add('highlight')
    } else {
      el.value = this.currentLocation || ''
      setCursor(el, el.value.length)
    }
    highlightedSuggestion.classList.remove('highlight')
  }
}

/**
 * Press Down
 */

LocationSuggest.prototype.pressDown = function (highlightedSuggestion, el) {
  if (!highlightedSuggestion) {
    var suggestion = this.find('.suggestion')
    if (suggestion) suggestion.classList.add('highlight')
  } else if (highlightedSuggestion.nextElementSibling) {
    highlightedSuggestion.nextElementSibling.classList.add('highlight')
    highlightedSuggestion.classList.remove('highlight')
  }
}

/**
 * Set cursor
 */

function setCursor (node, pos) {
  node = (typeof node === 'string' || node instanceof String) ? document.getElementById(node) : node

  if (!node) return

  if (node.createTextRange) {
    var textRange = node.createTextRange()
    textRange.collapse(true)
    textRange.moveEnd(pos)
    textRange.moveStart(pos)
    textRange.select()
  } else if (node.setSelectionRange) {
    node.setSelectionRange(pos, pos)
  }

  return false
}

function cleanText (text) {
  text = text.replace(/<\/?[^>]+(>|$)/g, '')
  return text.trim()
}

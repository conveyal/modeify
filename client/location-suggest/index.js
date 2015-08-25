var geocode = require('geocode')
var hogan = require('hogan.js')
var log = require('./client/log')('location-suggest')
var each = require('each')


var LocationSuggest = module.exports = function() {}

/**
 * Suggestions Template
 */

var suggestionsTemplate = hogan.compile(require('./suggestions.html'))

/**
 * Suggest
 */

LocationSuggest.prototype.suggest = function (e) {
  var input = e.target
  var text = input.value || ''
  var inputGroup = input.parentNode
  var suggestionList = inputGroup.getElementsByTagName('ul')[0]
  var view = this

  // If the text is too short or does not contain a space yet, return
  if (text.length < 4 || text.indexOf(' ') === -1 || text.lastIndexOf(' ') + 1 ===
    text.length) return

  // Get a suggestion!
  geocode.suggest(text, function (err, suggestions) {
    if (err) {
      log.error('%e', err)
    } else {
      if (suggestions && suggestions.length > 0) {
        suggestions = suggestions.slice(0, 4)

        suggestionList.innerHTML = suggestionsTemplate.render({
          suggestions: suggestions
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
  })
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
  if (highlight) {
    e.target.value = highlight.textContent || ''
  }

  suggestionList.classList.add('empty')

  setTimeout(function () {
    suggestionList.innerHTML = ''
  }, 250)

  inputGroup.classList.remove('highlight')

  this.locationSelected(e.target, e.target.value)
}

/**
 * Keypress
 */

LocationSuggest.prototype.keydownInput = function (e) {
  var el = e.target
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

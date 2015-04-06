var analytics = require('analytics')
var log = require('./client/log')('welcome-flow:welcome')
var message = require('messages')('welcome-flow:welcome')
var modal = require('./client/modal')
var template = require('./template.html')

var Welcome = module.exports = modal({
  logo: true,
  message: message,
  template: template
})

/**
 * Save
 */

Welcome.prototype.clickedAnswer = function (e) {
  e.preventDefault()
  log('--> saving')

  var el = e.target
  while (!el.classList.contains('answer') && el.parentNode) el = el.parentNode
  var answer = el.getAttribute('data-answer') || ''
  if (answer && answer.length > 1) {
    this.recordAnswer(answer)
    this.emit('next')
  } else {
    log.warn('-- invalid answer')
  }
}

/**
 * Record Answer
 */

Welcome.prototype.recordAnswer = function (answer) {
  analytics.track('Selected Commuter Type', {
    mode: answer
  })

  this.model.updateProfile('initial_mode_of_transportation', answer)
  this.model.save()
}

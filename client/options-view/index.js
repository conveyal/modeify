var FeedbackModal = require('../feedback-modal')
var message = require('../messages')('options-view')
var RouteCardView = require('../route-card-view')
var view = require('../view')
var _tr = require('../translate')

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, model) {
  _tr.inHTML(view, 'span')
  _tr.inHTML(view, '.title2')
  view.lastResponse = {}
  model.on('updating options complete', function (data) {
    view.errorMessage = data.err
    model.emit('change optionsSummary')
  })
})

/**
 * Set the routes view
 */

View.prototype['options-view'] = function () {
  return RouteCardView
}

View.prototype.optionsSummary = function () {
  if (this.optionsCount() > 0) {
    return _tr('Found ') + '<strong>' + this.optionsCount() + '</strong> ' + /*this.modeList() + ' ' +*/ _tr(this.optionsPlural())
  } else {
    return this.errorMessage || ''
  }
}

View.prototype.optionsCount = function () {
  return this.model.options().length
}

View.prototype.modeList = function () {
  var modes = []
  if (this.model.bus() || this.model.train()) modes.push(_tr('transit'))
  if (this.model.bike() || this.model.bikeShare()) modes.push(_tr('biking'))
  if (this.model.car()) modes.push(_tr('driving'))
  if (this.model.walk()) modes.push(_tr('walking'))

  if (modes.length > 1) modes[modes.length - 1] = ' &amp; ' + modes[modes.length - 1]

  return modes.join(modes.length > 2 ? ', ' : ' ')
}

View.prototype.optionsPlural = function () {
  return 'option' + (this.optionsCount() > 1 ? 's' : '')
}

View.prototype.feedback = function (e) {
  e.preventDefault()
  FeedbackModal().show()
}

View.prototype['feedback-text'] = function () {
  return message('feedback-text')
}

View.prototype['feedback-link-text'] = function () {
  return message('feedback-link-text')
}

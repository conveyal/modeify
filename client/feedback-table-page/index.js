var Feedback = require('./feedback')
var request = require('./client/request')
var view = require('view')

var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  request.get('/feedback', function (err, feedback) {
    if (err) {
      window.alert(err) // eslint-disable-line no-alert
    } else {
      ctx.view = new View({
        feedback: feedback.body
      })
      next()
    }
  })
}

View.prototype['feedback-view'] = function () {
  return Feedback
}

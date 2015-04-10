var Feedback = require('./feedback')
var Plan = require('plan')
var request = require('./client/request')
var view = require('view')

var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  request.get('/feedback', function (err, feedback) {
    if (err) {
      window.alert(err) // eslint-disable-line no-alert
    } else {
      ctx.view = new View({
        feedback: (feedback.body || []).map(function (f) {
          f.plan = new Plan(f.plan)
          var from = f.plan.from()
          var to = f.plan.to()
          f.plan.set({
            from: from.lon + ',' + from.lat,
            to: to.lon + ',' + to.lat
          })
          return f
        })
      })
      next()
    }
  })
}

View.prototype['feedback-view'] = function () {
  return Feedback
}

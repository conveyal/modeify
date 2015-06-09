var config = require('config')
var fmt = require('fmt')
var otp = require('otp')
var request = require('request')
var view = require('view')

var Feedback = module.exports = view(require('./feedback.html'))

Feedback.prototype.link = function () {
  return fmt('%s/planner?%s', config.base_url(), decodeURIComponent(this.model.plan.generateQueryString()))
}

Feedback.prototype.summary = function () {
  return this.model.results ? this.model.results.summary : ''
}

Feedback.prototype.name = function () {
  var commuter = this.model._commuter ? this.model._commuter : {}
  return commuter.name || commuter.email || 'Anonymous'
}

Feedback.prototype.resultsLink = function () {
  var query = this.model.plan.generateQuery()
  query.from = this.model.plan.from().split(',')
  query.from = {
    lat: query.from[1],
    lon: query.from[0]
  }
  query.to = this.model.plan.to().split(',')
  query.to = {
    lat: query.to[1],
    lon: query.to[0]
  }
  return otp.url(query)
}

Feedback.prototype.delete = function () {
  var self = this
  request.del('/feedback/' + this.model._id, function (err) {
    if (err) {
      window.alert(err)
    } else {
      self.el.remove()
    }
  })
}

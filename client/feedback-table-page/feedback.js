var config = require('config');
var fmt = require('fmt');
var otp = require('otp');
var Plan = require('plan');
var qs = require('querystring');
var view = require('view');

var Feedback = module.exports = view(require('./feedback.html'));

Feedback.prototype.link = function() {
  var plan = this.model.plan;
  return fmt('%s/planner?%s', config.base_url(), decodeURIComponent(qs.stringify({
    from: plan.from,
    to: plan.to
  })));
};

Feedback.prototype.summary = function() {
  return this.model.results
    ? this.model.results.summary
    : '';
};

Feedback.prototype.name = function() {
  var commuter = this.model._commuter || {};
  return commuter.name || commuter.email || 'Anonymous';
};

Feedback.prototype.resultsLink = function() {
  var plan = new Plan(this.model.plan);
  return otp.url(plan.generateQuery());
};
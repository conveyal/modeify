/**
 * Dependencies
 */

var Alert = require('alert');
var alerts = require('alerts');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':commuter-form');
var go = require('go');
var serialize = require('serialize');
var template = require('./template.html');
var view = require('view');

/**
 * Create Page
 */

var Page = view(template);

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  debug('render');

  if (ctx.commuter) {
    ctx.view = new Page(ctx.commuter);
  } else {
    ctx.view = new Page(new Commuter({
      _organization: ctx.params.organization
    }));
  }
};

/**
 * Action
 */

Page.prototype.action = function() {
  if (this.model.isNew()) return 'Add';
  if (typeof this.model._organization() === 'string') return 'Edit';
  return 'Hello';
};

/**
 * Back?
 */

Page.prototype.back = function() {
  return this.model.isNew() ? '/organizations/' + this.model._organization() :
    '/organizations/' + this.model._organization() + '/commuters/' + this.model
    ._id();
};

/**
 * Labels
 */

Page.prototype.labels = function() {
  return this.model.labels().length > 0 ? this.model.labels().join(', ') : '';
};

/**
 * Save!
 */

Page.prototype.save = function(e) {
  debug('save');
  var data = serialize(this.el);
  data.labels = data.labels && data.labels.length > 0 ? data.labels.split(',') : [];
  data.labels = data.labels.map(function(label) {
    return label.trim();
  });
  data.zip = parseInt(data.zip);
  this.model.set(data);

  var text = this.model.isNew() ? 'Added new commuter.' :
    'Saved changes to commuter.';

  var self = this;
  this.model.save(function(err) {
    if (err) {
      new Alert({
        type: 'danger',
        text: err
      });
    } else {
      alerts.push({
        type: 'success',
        text: text
      });
      go(self.back());
    }
  });
};

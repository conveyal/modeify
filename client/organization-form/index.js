/**
 * Dependencies
 */

var Alert = require('alert');
var alerts = require('alerts');
var debug = require('debug')('organization-form');
var Organization = require('organization');
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

  if (ctx.organization) {
    ctx.view = new Page(ctx.organization);
  } else {
    ctx.view = new Page(new Organization());
  }
};

/**
 * Action
 */

Page.prototype.action = function() {
  return this.model.isNew() ? 'Create' : 'Edit';
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

  var text = this.model.isNew() ? 'Created new organization.' :
    'Saved changes to organization.';

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
      self.emit('go', '/organizations/' + self.model._id());
    }
  });
};

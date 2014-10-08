// var config = require('config');
var view = require('view');

var View = module.exports = view(require('./template.html'));

View.prototype.survey = function() {
  return '';
  /*return config.survey
    ? config.survey()
    : ''; */
};

View.prototype.email = function() {
  return '';
  // return config.email().address;
};
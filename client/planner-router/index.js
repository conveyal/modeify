
/**
 * Dependencies
 */

var plannerPage = require('planner-page');
var Router = require('router');

/**
 * Expose `router`
 */

var router = module.exports = new Router()
  .on('/planner', plannerPage);

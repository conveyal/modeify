/**
 * Dependencies
 */

// var Commuter = require('commuter');
// var introduction = require('introduction-page');
var onLoad = require('on-load');
var page = require('page');

/**
 * Set up routes
 */

page('/', redirect('/planner'));
page('/planner', /* session.load, introduction */ require('planner-page'));
// page('/planner/profile', function() {});
page('/planner/:link', /*session.load, Commuter.loadLink,*/ redirect('/planner'));

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function() {
  // show nav ?

  // listen
  page();
});

/**
 * redirect
 */

function redirect(to) {
  return function(ctx, next) {
    page(to);
  };
}

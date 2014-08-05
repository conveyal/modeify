var raf = require('raf');

var body = document.body;
var docEl = document.documentElement;
var eve;

/**
 * Expose `mouse`
 */

var mouse = module.exports = {};

/**
 * Run `updateLoop`
 */

updateloop();

/**
 * Save mouse move event
 */

window.addEventListener('mousemove', function(e) {
  eve = e || window.event;
});

/**
 * Run update once per animation frame
 */

function updateloop() {
  raf(updateloop);
  update();
}

/**
 * Update mouse position
 */

function update() {
  if (!eve) return;

  if (eve.pageX || eve.pageY) {
    mouse.x = eve.pageX;
    mouse.y = eve.pageY;
  } else {
    mouse.x = eve.clientX + body.scrollLeft + docEl.scrollLeft;
    mouse.y = eve.clientY + body.scrollTop + docEl.scrollTop;
  }

  eve = undefined;
}

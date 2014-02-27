
/**
 * Bind event
 */

var evnt = require('event');

/**
 * Expose `plugin`
 */

module.exports = function(reactive) {
  reactive.bind('data-active', function(el, name) {
    var view = this.reactive.view;

    evnt.bind(el, 'click', function(e) {
      if (!view && !view.setActive) throw new Error('method .setActive is missing.');

      var el = e.target;
      var val = el.dataset.active;

      if (!val) {
        el = el.parentNode;
        val = el.dataset.active;
      }

      // toggle the value
      view.model[val](!el.classList.contains('active'));
      document.activeElement.blur();
    });

    this.change(function() {
      var val = this.value(name);
      if (val) el.classList.add('active');
      else el.classList.remove('active');
    });
  });
};

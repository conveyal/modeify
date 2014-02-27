/**
 * Expose `plugin`
 */

module.exports = function(reactive) {
  reactive.bind('data-active', function(el, name) {
    this.change(function() {
      var val = this.value(name);
      if (val) el.classList.add('active');
      else el.classList.remove('active');
    });
  });
};

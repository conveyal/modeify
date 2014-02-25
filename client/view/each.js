/**
 * `data-each="items"`
 */

module.exports = function(reactive) {
  reactive.bind('data-each', function(el, attr) {
    var container = this.el;
    this.change(function() {
      container.innerHTML = '';

      var items = this.value(attr);
      if (!items || items.forEach === undefined || items.length === 0)
        return;

      var View = this.value(attr + '-view');
      if (!View) return;

      items.forEach(function(item) {
        var view = new View(item);
        container.appendChild(view.el);
      });
    });
  });
};

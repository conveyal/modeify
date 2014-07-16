var domify = require('domify');
var value = require('value');

/**
 * Expose `plugin`
 */

module.exports = function(reactive) {
  reactive.bind('select-options', function(el, name, model) {
    this.change(function() {
      var options = this.value(name);
      var list = '';

      if (!options || !Array.isArray(options)) return;

      options.forEach(function(option) {
        var name = option.name || option;
        var value = option.value || option;
        list += '<option value="' + value + '">' + name + '</option>';
      });

      el.appendChild(domify(list));
    });
  });

  reactive.bind('select-value', function(el, name, model) {
    this.change(function() {
      var current = value(el);
      var val = this.value(name);
      if (val !== undefined && current != val) value(el, '' + val);
    });

    var parse = this.view[el.getAttribute('select-parse-value')] || function(
      v) {
      return v;
    };

    var view = this.view;
    el.onchange = function(e) {
      var val = parse(value(el));
      model[name](val);
      view.emit('selected', name, val);
    };
  });
};

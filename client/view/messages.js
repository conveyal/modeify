var message = require('messages')()

module.exports = function(reactive) {
  reactive.bind('data-message', function(el, name) {
    this.change(function() {
      el.innerHTML = message(name);
    });
  });
};

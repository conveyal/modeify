var tap = require('tap');

module.exports = function(reactive) {
  reactive.bind('on-tap', function(el, method){
    var view = this.reactive.view;
    tap(el, function(e) {
      var fn = view[method];
      if (!fn) throw new Error('method .' + method + '() missing');
      view[method](e);
    });
  });
};

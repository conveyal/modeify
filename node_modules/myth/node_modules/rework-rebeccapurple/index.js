(function () {
  var rework = require('rework');
  var match = /(rebeccapurple)\b/i;
  var colorvalue = '#663399';

  module.exports = function (stylesheet) {
    stylesheet.rules.map(rule);
  };

  function rule(obj) {
    if (obj.declarations) {
      obj.declarations.map(declaration);
    }
    if (obj.rules) {
      obj.rules.map(rule);
    }
    return obj;
  }

  function declaration(obj) {
    if (obj.type === 'declaration' && match.test(obj.value)) {
      obj.value = obj.value.replace(match, colorvalue);
    }
    return obj;
  }

}());

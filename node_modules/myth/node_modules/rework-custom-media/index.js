/**
 * Constants.
 */

var EXTENSION_RE = /\((--[\w-]+)\)/;

/**
 * Module export.
 */

module.exports = function customMedia(ast) {
  var map = {};
  var indices = [];

  // define custom media query aliases
  ast.rules.forEach(function (rule, i) {
    if (rule.type !== 'custom-media') return;
    map[rule.name] = rule.media;
    indices.push(i);
  });

  // substitute custom media query aliases
  ast.rules.forEach(function (rule, i) {
    if (rule.type !== 'media') return;
    rule.media = rule.media.replace(EXTENSION_RE, function(_, name) {
      var replacement = map[name];
      var column = rule.position.start.column;
      var line = rule.position.start.line;
      var source = rule.position.source;

      if (replacement) {
        return replacement;
      } else {
        console.warn(
          'WARNING: undefined CSS custom media alias "' + name + '" at ' +
          line + ':' + column + (source ? ' in ' + source : '') + '.\n' +
          'The rule has been removed from the output. Please check your ' +
          '@custom-media definitions.'
        );
        indices.push(i);
      }
    });
  });

  // remove @custom-media blocks from css in reverse order to avoid affecting
  // indices before they are removed
  for (var i = indices.length - 1; i >= 0; i -= 1) {
    ast.rules.splice(indices[i], 1);
  }
};

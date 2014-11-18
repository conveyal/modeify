var fs = require('graceful-fs')

/**
 * Check if a file exists. Throws if it does not.
 * Mostly just for a nicer error message.
 *
 * @param {String} filename
 * @return {Object}
 * @api public
 */

exports.exists = function* (filename) {
  try {
    return yield fs.stat.bind(null, filename);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('file "' + filename + '" does not exist.');
    throw err;
  }
}

/**
 * Unlink a file. Ignores errors incase it doesn't exist.
 *
 * @param {String} filename
 * @api public
 */

exports.unlink = function* (filename) {
  try {
    yield fs.unlink.bind(null, filename);
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
}

/**
 * This is how the url rewriter and file copy/symlink will rewrite the file names.
 * This will create names like github's with `/`s.
 * i.e. fortawesome/fontawesome/v4.0.3/fonts/font.woff
 * and, for local components, lib/my-local-component/image.png
 *
 * @param {Object} branch
 * @return {String}
 * @api public
 */

exports.rewriteUrl = function (branch) {
  if (branch.type === 'local') return (branch.relativePath || branch.name).replace(/\\/g, '/');
  if (branch.type === 'dependency') return branch.name + '/' + branch.ref;
}

/**
 * Strip leading `./` from filenames.
 *
 * @param {String} filename
 * @return {String}
 * @api public
 */

exports.stripLeading = function (x) {
  if (x.slice(0, 2) === './') return x.slice(2);
  return x;
}

/**
 * Check if an object is a Generator Function.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

exports.isGeneratorFunction = function (obj) {
  return obj
    && obj.constructor
    && 'GeneratorFunction' === obj.constructor.name;
}


/*
 * css-url-rewriter
 * https://github.com/callumlocke/css-url-rewriter
 *
 * Copyright (c) 2014 Callum Locke
 * Licensed under the MIT license.
 */

// Regex to find CSS properties that contain URLs
// Fiddle: http://refiddle.com/refiddles/css-url-matcher
// Railroad: http://goo.gl/LXpk52
var cssPropertyMatcher = /@import[^;]*|[;\s]?\*?[a-zA-Z\-]+\s*\:\#?[^;}]*url\(\s*['"]?[^'"\)\s]+['"]?\s*\)[^;}]*/g;

// Regex to find the URLs within a CSS property value
// Fiddle: http://refiddle.com/refiddles/match-multiple-urls-within-a-css-property-value
// Railroad: http://goo.gl/vQzMcg
var urlMatcher = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/g;

var defaults = {
  excludeProperties: ['behavior', '*behavior']
};

exports.rewriteCSSURLs = function rewriteCSSURLs(css, settings, rewriterFn) {
  // Normalise arguments and settings
  if (typeof settings === 'function') {
    rewriterFn = settings;
    settings = defaults;
  }

  // Return the modified CSS
  var result = css.toString().replace(cssPropertyMatcher, function(property) {
    // This function deals with an individual CSS property.

    // If this property is excluded, return it unchanged
    if (settings.excludeProperties.length) {
      var propertyName = property.split(':')[0].replace(/^\s+|\s+$/g, '');

      for (var i = settings.excludeProperties.length - 1; i >= 0; i--) {
        if (propertyName.indexOf(settings.excludeProperties[i]) === 0) {
          return property;
        }
      }
    }

    // Return the property with the URL rewritten
    return property.replace(urlMatcher, function(urlFunc, justURL) {
      return urlFunc.replace(justURL, rewriterFn(justURL));
    });
  });

  return result;
};

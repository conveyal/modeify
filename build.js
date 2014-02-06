
/**
 * Dependencies
 */

var Builder = require('component-builder');
var fs = require('fs');
var mkdir = require('mkdirp');
var minify = require('minify');
var myth = require('myth');
var path = require('path');
var resolve = path.resolve;
var write = fs.writeFileSync;

/**
 * Expose `build`
 */

module.exports = build;

/**
 * Run if not `require`d
 */

if (!module.parent) {
  build();
}

/**
 * Config
 */

var config = {
  'ENV': process.env.NODE_ENV,
  'BASE_URL': process.env.BASE_URL
};

/**
 * Build.
 */

function build() {
  /**
   * Settings.
   */

  var dest = 'build';
  var production = process.env.NODE_ENV === 'production';

  /**
   * Builder.
   */

  var builder = new Builder('.');
  builder.copyAssetsTo(dest);
  builder.prefixUrls('/' + dest);
  builder.copyFiles(true);

  if (!production) {
    builder.development(true);
    builder.addSourceURLs(true);
  }

  builder.build(function (err, res) {
    if (err) throw err;
    mkdir.sync(dest);

    if (res.js) {
      js = 'window.CONFIG=' + JSON.stringify(config) + ';' + res.require + res.js + ';require(\'boot\');';
      if (production) js = minify.js(js);
      write(resolve(dest, 'build.js'), js);
    }

    if (res.css) {
      css = myth(res.css);
      if (production) css = minify.css(css);
      write(resolve(dest, 'build.css'), css);
    }
  });
}

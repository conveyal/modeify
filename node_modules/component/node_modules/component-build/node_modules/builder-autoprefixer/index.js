var autoprefix = require('autoprefixer-core');
var crypto = require('crypto');

var cache = Object.create(null);

module.exports = function (options) {
  options = options || {};
  var prefixerOptions = {
    cascade: true
  };
  var browsers = options.browsers;
  if (browsers != null) {
    if (browsers === '') {
      browsers = [];
    }
    else if (!Array.isArray(browsers)) {
      browsers = browsers.split(',').map(function(i) {return i.trim()});
    }
    prefixerOptions.browsers = browsers;
  }

  return function autoprefixer(file, done) {
    if (file.extension !== 'css') return done();
    file.read(function (err, string) {
      if (err) return done(err);
      var hash = (browsers||[]).join(',') + calculate(string);
      var res;
      try {
        res = cache[hash] = cache[hash] || autoprefix(prefixerOptions).process(string);
      } catch (err) {
        done(err);
        return;
      }

      file.string = res.css;
      done();
    })
  }
}

function calculate(string) {
  return crypto.createHash('md5')
    .update(string)
    .digest('hex');
}

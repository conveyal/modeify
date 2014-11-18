
var fs = require('fs');
var path = require('path');
var bytes = require('bytes');
var request = require('cogent');
var log = require('component-consoler').log;

var uri = 'http://component-crawler.herokuapp.com/.json';
var filename = cache.filename = path.resolve(__dirname, '../components.json');

module.exports = cache;

function* cache(options) {
  options = options || {};
  if (options.force) return yield* cache.update(options);

  // one hour
  var maxage = options.maxage || 3600000;
  var age = cache.age();
  if (!age || Date.now() - age > maxage) return yield* cache.update(options);
}

cache.age = function () {
  try {
    return fs.statSync(filename).ctime.getTime();
  } catch (err) {
    return false;
  }
}

cache.update = function* (options) {
  var verbose = options && options.verbose;
  if (verbose) log('search', 'updating local cache');
  try {
    yield fs.unlink.bind(null, filename);
  } catch (err) {}
  var res = yield* request(uri, filename);
  if (verbose) {
    var stats = yield fs.stat.bind(null, filename);
    log('search', 'local cache size: ' + bytes(stats.size));
  }
  return res;
}

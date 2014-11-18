
var fs = require('fs');
var es = require('event-stream');
var JSONStream = require('JSONStream');
var toArray = require('stream-to-array');

var cache = search.cache = require('./cache');
var fns = require('../lib/functions');

module.exports = search;

function* search(options) {
  yield* cache(options);

  var filters = [];

  if (options.keywords) {
    options.keywords.forEach(function (keyword) {
      filters.push(fns.filterBy.keyword(keyword));
    })
  }

  if (options.owner) {
    filters.push(fns.filterBy.owner(options.owner));
  }

  if (options.text) {
    filters.push(fns.filterBy.text(options.text));
  }

  var components = yield toArray(fs.createReadStream(cache.filename)
  .pipe(JSONStream.parse('components.*'))
  .pipe(es.map(function (data, callback) {
    if (filters.every(function (filter) {
      return filter(data);
    })) return callback(null, data);
    callback();
  })));

  return components
    .sort(fns.sortBy.starsAndWatchers)
    .slice(0, options.limit || 10);
}
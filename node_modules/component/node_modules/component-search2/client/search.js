
var crawler = search.crawler = require('./crawler');
var fns = require('../lib/functions');

module.exports = search

/**
 * Right now, `query` must be a string,
 * and we'll search intelligently based on it.
 * In the future, we should allow options
 * like the node version.
 */

function search(query, limit) {
  query = (query || '').toLowerCase().trim();

  // don't need to show every component
  if (!query) {
    return crawler.components
      .sort(fns.sortBy.starsAndWatchers)
      .slice(0, limit || 25);
  }

  // search by <user>/<repo>
  if (/^[\w-]+\//.test(query)) {
    return crawler.components
      .filter(function (json) {
        return !json.github.full_name.indexOf(query);
      })
      .sort(function (a, b) {
        // sort by the length of the name, ascending
        return a.github.full_name.length
          - b.github.full_name.length;
      })
      .slice(0, limit || 25)
  }

  var filters = [];

  filters.push(fns.filterBy.text(query));

  query.split(/\s*/)
    .filter(Boolean)
    .filter(function (keyword) {
      // check only alphanumerics
      return /^\w+$/.test(keyword);
    })
    .forEach(function (keyword) {
      filters.push(fns.filterBy.keyword(keyword));
    })

  return crawler.components
    .filter(function (json) {
      return filters.some(function (filter) {
        return filter(json);
      });
    })
    .sort(fns.sortBy.starsAndWatchers)
    .slice(0, limit || 25);
}
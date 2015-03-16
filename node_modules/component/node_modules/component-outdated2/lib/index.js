
var log = require('component-consoler').log;
var flatten = require('component-flatten');
var remotes = require('component-remotes');
var semver = require('semver');

module.exports = function* (tree, options) {
  options = options || {};
  var verbose = options.verbose;
  var development = options.development;

  // to do: custom remotes
  var remote = new remotes.github(options);
  var fns = [];
  var start = Date.now();
  if (verbose) log('outdated', 'checking ' + tree.name + ' for outdated dependencies');

  flatten(tree)
  .filter(isLocal)
  .forEach(function (node) {
    var json = node.node;
    push(json.dependencies || {});
    if (development) push((json.development || {}).dependencies || {}, true);

    function push(deps, dev) {
      Object.keys(deps).forEach(function (name) {
        var version = deps[name];
        if (!semver.valid(version)) return;

        fns.push(function* () {
          var versions = yield* remote.versions(name);
          if (!versions || !versions.length) return;

          var latest = versions[0];
          if (semver.eq(version, latest)) return;

          log('outdated', node.name + '\'s '
            + (dev ? 'development ' : '')
            + 'dependency "' + name + '" is outdated.');
          log('outdated', '  current: "' + version + '"');
          log('outdated', '   latest: "' + latest + '"');
        })
      })
    }
  })

  yield fns;

  if (verbose) log('outdated', 'checked ' + tree.name + ' for outdated dependencies in ' + (Date.now() - start) + 'ms');
}

function isLocal(node) {
  return node.type === 'local';
}

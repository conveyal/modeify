
var log = require('component-consoler').log;
var flatten = require('component-flatten');
var remotes = require('component-remotes');
var semver = require('semver');
var fs = require('fs');
var write = fs.writeFile;

module.exports = function* (tree, options) {
  options = options || {};
  var verbose = options.verbose;
  var development = options.development;

  // to do: custom remotes
  var remote = new remotes.github(options);
  var fns = [];
  var start = Date.now();
  if (verbose) log('update', 'updating ' + tree.name + '\'s pinned dependencies');

  flatten(tree)
  .filter(isLocal)
  .forEach(function (node) { fns.push(function* () {
    var component;
    var json = node.node;
    var fns = [];
    var updates = [];

    push(json.dependencies || {}, false);
    if (development) push((json.development || {}).dependencies || {}, true);

    yield fns;

    if (!updates.length) return;

    component = yield* read(node.filename);
    updates.forEach(call);

    yield write.bind(null, node.filename, JSON.stringify(component, null, 2));

    function push(deps, dev) {
      Object.keys(deps).forEach(function (name) {
        var version = deps[name];
        if (!semver.valid(version)) return;

        fns.push(function* () {
          var versions = yield* remote.versions(name);
          if (!versions || !versions.length) return;

          var latest = versions[0];
          if (semver.eq(version, latest)) return;

          updates.push(function () {
            // to do: backwards compatibility
            var dep = dev
              ? component.development.dependencies
              : component.dependencies;
            dep[name] = latest;

            if (verbose) log('update', node.name + '\'s dependency "' + name + '" from "' + version + '" to "' + latest + '".');
          })
        })
      })
    }
  })})

  yield fns;

  if (verbose) log('update', 'updated ' + tree.name + '\'s ranged dependencies in ' + (Date.now() - start) + 'ms');
}

function isLocal(node) {
  return node.type === 'local';
}

function call(fn) {
  fn();
}

function* read(filename) {
  var string = yield fs.readFile.bind(null, filename, 'utf8');
  return JSON.parse(string);
}

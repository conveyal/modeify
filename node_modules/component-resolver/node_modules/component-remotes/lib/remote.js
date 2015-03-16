/**
 * This is the base Remote constructor to inherit from.
 *
 * You do not actually use this constructor;
 * you extend from it with Remote.extend().
 */

var EventEmitter = require('events').EventEmitter;
var validate = require('component-validator');
var inherits = require('util').inherits;
var request = require('cogent');
var semver = require('semver');

module.exports = Remote

inherits(Remote, EventEmitter)

/**
 * Extend a constructor from the currency constructor.
 * Usage:
 *
 *   function GitHub(options) {
 *     if (!(this instanceof GitHub)) return new Github(options)
 *     options = options || {}
 *     Remote.call(this, options)
 *   }
 *
 *   Remote.extend(GitHub)
 *
 * @param {Remote} this
 * @param {Function} Child
 * @return Child
 * @api public
 */

Remote.extend = function (Child) {
  inherits(Child, this);
  Object.keys(this).forEach(function (key) {
    Child[key] = this[key]
  }, this)
  return Child
}

/**
 * @param {Object} options
 * @api public
 */

function Remote(options) {
  options = options || {}

  // you'll get a lot of error messages others
  // if you have a large app with a lot of
  // shared dependencies
  this.setMaxListeners(options.maxListeners || Infinity);

  this.request = request.extend(options);

  // we handle retires ourselves
  this.retries = options.retries || 1;

  // cache for component versions
  this.c_versions = Object.create(null);

  // cache for component@version's component.json
  this.c_json = Object.create(null);

  // cache for component@version's git tree
  this.c_tree = Object.create(null);
}

/**
 * So you don't have to differentiate between a `remotes` instance and a `Remote` instance.
 *
 * @return {this}
 * @api public
 */

Remote.prototype.resolve = function* (remotes, repo, ref) {
  // TODO: this is ugly
  if (typeof remotes === 'string') {
    ref = repo;
    repo = remotes;
  } else if (Array.isArray(remotes) && !~remotes.indexOf(this.name)) {
    // if the current remote is not in this list,
    // then it's obviously not valid.
    return;
  }
  var versions = yield* this.getAvailableVersions(remotes, repo, ref);
  
  // TODO: this looks not good, should return null or something like that
  if (versions == null) versions = ['master']; 

  // add master, if there are no versions published
  if (versions.length === 0) versions.push('master');

  // TODO: are there use cases where ref is not defined?
  var reference = ref || versions[0];
  
  var json = yield* this.json(repo, reference);
  if (json) return this;
};

Remote.prototype.isValid = function* (remotes, repo, ref) {
  var versions = yield* this.getAvailableVersions(remotes, repo, ref);
  if (versions == null) return false;
  // return true if there are some version, or there are no version published (empty array)
  return true;
};

/**
 * There are two use cases for this function:
 * 1. Just to check if a repo exist via isValid()
 * 2. Get available versions
 *
 * @return {this}
 * @api public
 */
Remote.prototype.getAvailableVersions = function* (remotes, repo, ref) {
  if (typeof remotes === 'string') {
    ref = repo;
    repo = remotes;
  } else if (Array.isArray(remotes) && !~remotes.indexOf(this.name)) {
    // if the current remote is not in this list,
    // then it's obviously not valid.
    return;
  }
  // use latest tag, and if it's not available, then master
  var availableVersions = yield* this.versions(repo);
  return availableVersions;
};

/**
 * Caching wrapper around getting component versions.
 * Filter by valid semantic versions and order them descendingly.
 *
 * @param {String} repo
 * @return {Array} references
 * @api public
 */

Remote.prototype.versions = function* (repo) {
  if (!repo) {
    console.log("repo: "+repo);
    console.log(new Error().stack);
  }

  repo = repo.toLowerCase();
  var event = 'version:' + repo;
  var cache = this.c_versions;

  // already resolved or in-flight
  if (repo in cache)
    return cache[repo] === 'resolving'
      ? (yield this.await(event))
      : cache[repo];

  cache[repo] = 'resolving';
  var references;
  try {
    references = yield* this._versions(repo);
  } catch (err) {
    // catch 404 and non 200 status codes
    // references = undefined
  }
  var versions = cache[repo] = references
    ? references.filter(valid).sort(semver.rcompare)
    : null;
  this.emit(event, versions);
  return versions;
}

/**
 * Caching wrapper around getting a component.json.
 *
 * @param {String} repo
 * @param {String} reference
 * @return {Object} component.json
 * @api public
 */

Remote.prototype.json = function* (repo, ref) {
  repo = repo.toLowerCase();
  var slug = repo + '@' + ref;
  var event = 'json:' + slug;
  var cache = this.c_json;

  // already resolved or in-flight
  if (slug in cache)
    return cache[slug] === 'resolving'
      ? (yield this.await(event))
      : cache[slug];

  cache[slug] = 'resolving';
  var json = yield* this._json(repo, ref);
  if (json) {
    // fix properties like .repo,
    // but not log anything because we're not npm.
    // there's nothing end users can do.
    validate(json, {
      verbose: false
    });
    var valid = semver.valid(ref);
    // overwrite the version in case it wasn't updated
    if (valid) json.version = valid;
    // add a repo property
    // to do: handle redirects
    if (!json.repository) json.repository = repo;
  } else {
    // i don't like `undefined`s
    json = null;
  }
  cache[slug] = json;
  this.emit(event, json);
  return json;
}

/**
 * Caching wrapper around getting a component's tree.
 * Should be a list of files with the following properties:
 *
 *   - sha - sha1sum
 *   - path
 *   - size
 *
 * This is pretty slow - avoid using it.
 *
 * @param {String} repo
 * @param {String} ref
 * @return {Array} objects
 * @api public
 */

Remote.prototype.tree = function* (repo, ref) {
  repo = repo.toLowerCase();
  var slug = repo + '@' + ref;
  var event = 'tree:' + slug;
  var cache = this.c_tree;

  if (slug in cache)
    return cache[slug] === 'resolving'
      ? (yield this.await(event))
      : cache[slug];

  cache[slug] = 'resolving';
  var tree = yield* this._tree(repo, ref);
  tree = tree || null;
  cache[slug] = tree;
  this.emit(event, tree);
  return tree;
}

/**
 */

Remote.prototype.file = function () {
  /*
  return []
  */
}

/**
 */

Remote.prototype.archive = function () {
  /*
  return {
    zip: [],
    tar: [],
  }
  */
}

/**
 * Await an event. Returns the event.
 * This is useful for waiting for inflight requests to finish.
 *
 * @param {String} event
 * @api private
 */

Remote.prototype.await = function (event) {
  var self = this
  return function (done) {
    self.once(event, function (result) {
      done(null, result)
    })
  }
}

// check is a version is valid
function valid(x) {
  return semver.valid(x);
}

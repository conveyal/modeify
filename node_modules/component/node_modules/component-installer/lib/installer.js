
/**
 * Module dependencies.
 */

var Batch = require('batch');
var debug = require('debug')('component:installer');
var fs = require('fs');
var read = fs.readFileSync;
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var path = require('path');
var Package = require('component-package');
var resolve = path.resolve;
var exists = fs.existsSync;
var join = path.join;

var COMPONENT_REMOTE = process.env.COMPONENT_REMOTE || 'https://raw.githubusercontent.com';

/**
 * Expose `Installer`.
 */

module.exports = Installer;

/**
 * Initialize a new `Installer` with the given component `dir`.
 *
 * @param {String} dir
 * @param {Installer} parent
 */

function Installer (dir, parent) {
  this.dir = dir;
  this._remotes = [];
  this._concurrency = 10;
  this.config = null;
}

/**
 * Inherit from `Emitter`.
 */

inherit(Installer, Emitter);

/**
 * Use a plugin `fn`.
 *
 * @param {Function} fn
 * @return {Installer}
 */

Installer.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Install development packages.
 *
 * @return {Installer}
 */

Installer.prototype.development = function () {
  this._development = true;
  return this;
};

/**
 * Set the destination `dir`.
 *
 * @param {String} dir
 * @return {Installer}
 */

Installer.prototype.destination = function (dir) {
  this._destination = dir;
  return this;
};

/**
 * Force installation of components.
 *
 * @return {Installer}
 */

Installer.prototype.force = function () {
  this._force = true;
  return this;
};

/**
 * Add a `remote`.
 *
 * @param {String} remote
 * @return {Installer}
 */

Installer.prototype.remote = function (remote) {
  this._remotes.push(remote);
  return this;
};

/**
 * Set a `proxy`.
 *
 * @param {String} proxy
 * @return {Installer}
 */

Installer.prototype.proxy = function (proxy) {
  this._proxy = proxy;
  return this;
};

/**
 * Set the `concurrency`
 *
 * @param {Number} concurrency
 * @return {Installer}
 */

Installer.prototype.concurrency = function (concurrency) {
  this._concurrency = concurrency;
  return this;
};

/**
 * Install local packages from `component.json`.
 *
 * @param {Function} callback
 */

Installer.prototype.install = function (callback) {
  var self = this;
  var batch = new Batch();

  this.on('package', function (pkg) {
    batch.push(function (done) {
      pkg.on('end', done);
      pkg.on('err', done);
      pkg.on('exists', function () { done(); });
    });
  });

  this.getDependencies(function (err, pkgs) {
    if (err) return callback(err);
    pkgs.forEach(function (pkg) {
      self.installPackage(pkg.name, pkg.version);
    });

    batch.end(function (err, res) {
      callback(err);
    });
  });
};

/**
 * Install a package with `name` at the given `version`.
 *
 * @param {String} name
 * @param {String} version
 */

Installer.prototype.installPackage = function (name, version) {
  this.touch('components');

  var pkg = new Package(name, version, {
    concurrency: this._concurrency,
    dest: this._destination,
    dev: this._development,
    force: this._force,
    proxy: this._proxy,
    remotes: this._remotes.concat([COMPONENT_REMOTE])
  });

  this.emit('package', pkg);

  // TODO: fix package to always emit `end` async
  process.nextTick(function () {
    // TODO: add callback
    pkg.install();
  });
};

/**
 * Get normalized dependencies from component.json, following paths and locals.
 *
 * @param {Function} fn
 * @api private
 */

Installer.prototype.getDependencies = function (callback) {
  var pkgs = [];
  var conf = this.json();
  var paths = conf.paths || [];

  // deps
  if (conf.dependencies) pkgs = pkgs.concat(normalize(conf.dependencies));

  // dev deps
  if (conf.development && this._development) pkgs = pkgs.concat(normalize(conf.development));

  // local deps
  if (conf.local) {
    conf.local.forEach(function (name) {
      try {
        var deps = dependenciesOf(name, paths);
        deps.map(normalize).forEach(function (deps) {
          pkgs = pkgs.concat(deps);
        });
      } catch (err) {
        callback(err);
      }
    });
  }

  callback(null, pkgs);
};

/**
 * Lookup `pkg` within `paths`.
 *
 * @param {String} pkg
 * @param {String} paths
 * @return {String} path
 * @api private
 */

function lookup(pkg, paths){
  pkg = pkg.toLowerCase();
  debug('lookup %s', pkg);
  for (var i = 0; i < paths.length; ++i) {
    var path = join(paths[i], pkg);
    debug('check %s', join(path, 'component.json'));
    if (exists(join(path, 'component.json'))) {
      debug('found %s', path);
      return path;
    }
  }
};

/**
 * Return the dependencies of local `pkg`,
 * as one or more objects in an array,
 * since `pkg` may reference other local
 * packages as dependencies.
 *
 * @param {String} pkg
 * @param {Array} [paths]
 * @return {Array}
 * @api private
 */

function dependenciesOf(pkg, paths, parent){
  paths = paths || [];
  var path = lookup(pkg, paths);
  if (!path && parent) throw new Error('failed to lookup "' + parent + '"\'s dep "' + pkg + '"');
  if (!path) throw new Error('failed to lookup "' + pkg + '"');
  var conf = require(resolve(path, 'component.json'));
  var deps = [conf.dependencies || {}];

  if (conf.local) {
    var localPaths = (conf.paths || []).map(function(depPath){
      return resolve(path, depPath);
    });

    conf.local.forEach(function(dep){
      deps = deps.concat(dependenciesOf(dep, paths.concat(localPaths), pkg));
    });
  }

  return deps;
};

/**
 * Return the configuration JSON.
 *
 * @return {Object}
 * @api private
 */

Installer.prototype.json = function () {
  if (this.config) return this.config;

  var path = this.path('component.json');
  debug('reading %s', path);

  var str = read(path, 'utf8');
  var obj;

  try {
    obj = JSON.parse(str);
  } catch (err) {
    err.message += ' in ' + path;
    throw err;
  }

  normalizeConf(obj);
  this.config = obj;
  return obj;
};

/**
 * Get a `path` relative to our directory.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

Installer.prototype.path = function (path) {
  return resolve(this.dir, path);
};

/**
 * Touch a `path` when present.
 *
 * @param {String} path
 * @api private
 */

Installer.prototype.touch = function (path) {
  try {
    fs.utimesSync(this.path(path), new Date(), new Date());
  } catch (err) {
    // ignore
  }
};

/**
 * Normalize `deps` into an array of objects.
 *
 * @param {Object} deps
 * @return {Array}
 */

function normalize (deps) {
  return Object.keys(deps).map(function (name) {
    return {
      name: name,
      version: deps[name]
    };
  });
}

/**
 * Normalize `conf`.
 *
 * @param {Object} conf
 */

function normalizeConf (conf) {
  // support "./" in main
  if (conf.main) conf.main = conf.main.replace(/^\.\//, '');
}

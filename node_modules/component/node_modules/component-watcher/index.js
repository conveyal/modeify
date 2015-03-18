
var fs = require('fs');
var sane = require('sane');
var resolve = require('path').resolve;
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('component-watcher');

// default extensions to check
var EXTENSIONS = {
  scripts: [
    'js',
    'json',
    'html',
  ],
  styles: [
    'css',
  ],
};

// default fields to check
var FIELDS = {
  scripts: [
    'scripts',
    'json',
    'templates',
  ],
  styles: [
    'styles',
  ]
};

module.exports = function componentWatcher(options) {
  options = options || {};

  var root = resolve(options.root || process.cwd());
  var filename = resolve(root, 'component.json');

  // make sure `component.json` exists
  try {
    fs.statSync(filename);
  } catch (err) {
    throw new Error('"' + filename + '" does not exist!');
  }

  var extensions = options.extensions || EXTENSIONS;
  var fields = options.fields || FIELDS;

  var json;
  var paths;
  var globs;
  var watcher;

  var emitter = new EventEmitter();

  emitter.restart =
  emitter.start = function () {
    if (watcher) watcher.close();
    watch();
    return emitter;
  };

  emitter.close =
  emitter.stop = function () {
    if (!watcher) return emitter;
    watcher.close();
    watcher = null;
    return emitter;
  };

  watch();

  return emitter;

  function watch() {
    try {
      json = read(filename);
    } catch (err) {
      console.error('could not read "' + filename + '", not watching.');
      return;
    }

    paths = json.paths || [];
    globs = ['component.json'];

    fields.scripts.forEach(addField);
    fields.styles.forEach(addField);
    paths.forEach(addPath);

    debug('watching globs: ' + globs.join(', '));

    watcher = sane(root, globs);
    watcher.on('ready', onReady);
    watcher.on('change', onUpdate);
    watcher.on('add', onChange);
    watcher.on('delete', onChange);
  }

  function onReady() {
    // always resolve on ready
    emitter.emit('resolve');
  }

  // when a file is updated
  function onUpdate(file) {
    debug('watcher emitted update: "%s"', file);

    // the main `component.json` has changed,
    // so we rewatch everything
    if (file === filename) return emitter.restart();

    // if a `component.json` is changed,
    // emit a resolve event
    if (/(\/)?component\.json$/.test(file)) return emitter.emit('resolve');

    var ext = file.split('.').pop();
    debug('watcher got extension: "%s"', ext);
    if (~extensions.scripts.indexOf(ext)) return emitter.emit('scripts');
    if (~extensions.styles.indexOf(ext)) return emitter.emit('styles');
  }

  // when a file is added or removed,
  // resolve
  function onChange(file) {
    debug('watcher emitted change: "%s"', file);

    // the main `component.json` has been added or removed,
    // so we rewatch everything
    if (file === filename) return emitter.restart();

    // otherwise, resolve
    emitter.emit('resolve');
  }

  function addField(field) {
    (json[field] || []).forEach(function (path) {
      if (path.slice(2) === '..') throw new Error('invalid path: ' + path);
      if (path.slice(1) === '/') throw new Error('invalid path: ' + path);

      // ./ paths
      if (path[0] === '.') path = path.slice(2);

      // only add globs if necessary
      if (!~globs.indexOf(path)) globs.push(path);
    });
    // do the same for development if --dev was passed and a development property exists
    if (options.development && json.development) {
      (json.development[field] || []).forEach(function (path) {
        if (path.slice(2) === '..') throw new Error('invalid path: ' + path);
        if (path.slice(1) === '/') throw new Error('invalid path: ' + path);

        // ./ paths
        if (path[0] === '.') path = path.slice(2);

        // only add globs if necessary
        if (!~globs.indexOf(path)) globs.push(path);
      });
    }
  }

  function addPath(path) {
    extensions.scripts.forEach(push);
    extensions.styles.forEach(push);

    function push(ext) {
      globs.push(path + '/**/*.' + ext);
    }
  }
};

function read(filename) {
  var json = fs.readFileSync(filename, 'utf8');
  return JSON.parse(json);
}

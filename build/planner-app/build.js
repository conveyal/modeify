window.CONFIG={"API_URL":"http://localhost:5000/api","BASE_URL":"http://localhost:5000","ENV":"production","MAPBOX_MAP_ID":"conveyal.h5bghhkn","NAME":"Commuters.io","OTP_URL":"http://localhost:8080/otp-rest-servlet/"};
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("timoxley-next-tick/index.js", function(exports, require, module){
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});
require.register("ianstormtaylor-callback/index.js", function(exports, require, module){

var next = require('next-tick');


/**
 * Expose `callback`.
 */

module.exports = callback;


/**
 * Call an `fn` back synchronously if it exists.
 *
 * @param {Function} fn
 */

function callback (fn) {
  if ('function' === typeof fn) fn();
}


/**
 * Call an `fn` back asynchronously if it exists. If `wait` is ommitted, the
 * `fn` will be called on next tick.
 *
 * @param {Function} fn
 * @param {Number} wait (optional)
 */

callback.async = function (fn, wait) {
  if ('function' !== typeof fn) return;
  if (!wait) return next(fn);
  setTimeout(fn, wait);
};


/**
 * Symmetry.
 */

callback.sync = callback;

});
require.register("ianstormtaylor-on-load/index.js", function(exports, require, module){

var callback = require('callback');


/**
 * Expose `onLoad`.
 */

module.exports = onLoad;


/**
 * Handlers.
 */

var fns = [];


/**
 * Loaded tester.
 */

var loaded = /loaded|complete/;


/**
 * Callback when the document is load.
 *
 * @param {Function} fn
 */

function onLoad (fn) {
  loaded.test(document.readyState) ? callback.async(fn) : fns.push(fn);
}


/**
 * Bind to load.
 */

document.addEventListener('DOMContentLoaded', function () {
  var fn;
  while (fn = fns.shift()) fn();
});
});
require.register("visionmedia-page.js/index.js", function(exports, require, module){

;(function(){

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' == typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' == typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
    // show <path> with [state]
    } else if ('string' == typeof path) {
      page.show(path, fn);
    // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path){
    if (0 == arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) window.addEventListener('click', onclick, false);
    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function(){
    running = false;
    removeEventListener('click', onclick, false);
    removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch){
    var ctx = new Context(path, state);
    if (false !== dispatch) page.dispatch(ctx);
    if (!ctx.unhandled) ctx.pushState();
    return ctx;
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */

  page.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state);
    ctx.init = init;
    if (null == dispatch) dispatch = true;
    if (dispatch) page.dispatch(ctx);
    ctx.save();
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx){
    var i = 0;

    function next() {
      var fn = page.callbacks[i++];
      if (!fn) return unhandled(ctx);
      fn(ctx, next);
    }

    next();
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    var current = window.location.pathname + window.location.search;
    if (current == ctx.canonicalPath) return;
    page.stop();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? path.slice(i + 1) : '';
    this.pathname = ~i ? path.slice(0, i) : path;
    this.params = [];

    // fragment
    this.hash = '';
    if (!~this.path.indexOf('#')) return;
    var parts = this.path.split('#');
    this.path = parts[0];
    this.hash = parts[1] || '';
    this.querystring = this.querystring.split('#')[0];
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(path
      , this.keys = []
      , options.sensitive
      , options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn){
    var self = this;
    return function(ctx, next){
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Array} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params){
    var keys = this.keys
      , qsIndex = path.indexOf('?')
      , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
      , m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];

      if (key) {
        params[key.name] = undefined !== params[key.name]
          ? params[key.name]
          : val;
      } else {
        params.push(val);
      }
    }

    return true;
  };

  /**
   * Normalize the given path string,
   * returning a regular expression.
   *
   * An empty array should be passed,
   * which will contain the placeholder
   * key names. For example "/user/:id" will
   * then contain ["id"].
   *
   * @param  {String|RegExp|Array} path
   * @param  {Array} keys
   * @param  {Boolean} sensitive
   * @param  {Boolean} strict
   * @return {RegExp}
   * @api private
   */

  function pathtoRegexp(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
          + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  }

  /**
   * Handle "populate" events.
   */

  function onpopstate(e) {
    if (e.state) {
      var path = e.state.path;
      page.replace(path, e.state);
    }
  }

  /**
   * Handle "click" events.
   */

  function onclick(e) {
    if (1 != which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' != el.nodeName) el = el.parentNode;
    if (!el || 'A' != el.nodeName) return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // same page
    var orig = path + el.hash;

    path = path.replace(base, '');
    if (base && orig == path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null == e.which
      ? e.button
      : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
  }

  /**
   * Expose `page`.
   */

  if ('undefined' == typeof module) {
    window.page = page;
  } else {
    module.exports = page;
  }

})();

});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = document.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-format-parser/index.js", function(exports, require, module){

/**
 * Parse the given format `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(str){
	return str.split(/ *\| */).map(function(call){
		var parts = call.split(':');
		var name = parts.shift();
		var args = parseArgs(parts.join(':'));

		return {
			name: name,
			args: args
		};
	});
};

/**
 * Parse args `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function parseArgs(str) {
	var args = [];
	var re = /"([^"]*)"|'([^']*)'|([^ \t,]+)/g;
	var m;
	
	while (m = re.exec(str)) {
		args.push(m[2] || m[1] || m[0]);
	}
	
	return args;
}

});
require.register("component-props/index.js", function(exports, require, module){

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(str, prefix){
  var p = unique(props(str));
  if (prefix) return prefixed(str, p, prefix);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` prefixed with `prefix`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function prefixed(str, props, prefix) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return prefix + _;
    if (!~props.indexOf(_)) return _;
    return prefix + _;
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-classes/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var arr = this.el.className.split(re);
  if ('' === arr[0]) arr.pop();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("ianstormtaylor-reactive/lib/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var adapter = require('./adapter');
var AttrBinding = require('./attr-binding');
var TextBinding = require('./text-binding');
var debug = require('debug')('reactive');
var bindings = require('./bindings');
var Binding = require('./binding');
var utils = require('./utils');
var query = require('query');

/**
 * Expose `Reactive`.
 */

exports = module.exports = Reactive;

/**
 * Bindings.
 */

exports.bindings = {};

/**
 * Define subscription function.
 *
 * @param {Function} fn
 * @api public
 */

exports.subscribe = function(fn){
  adapter.subscribe = fn;
};

/**
 * Define unsubscribe function.
 *
 * @param {Function} fn
 * @api public
 */

exports.unsubscribe = function(fn){
  adapter.unsubscribe = fn;
};

/**
 * Define a get function.
 *
 * @param {Function} fn
 * @api public
 */

exports.get = function(fn) {
  adapter.get = fn;
};

/**
 * Define a set function.
 *
 * @param {Function} fn
 * @api public
 */

exports.set = function(fn) {
  adapter.set = fn;
};

/**
 * Expose adapter
 */

exports.adapter = adapter;

/**
 * Define binding `name` with callback `fn(el, val)`.
 *
 * @param {String} name or object
 * @param {String|Object} name
 * @param {Function} fn
 * @api public
 */

exports.bind = function(name, fn){
  if ('object' == typeof name) {
    for (var key in name) {
      exports.bind(key, name[key]);
    }
    return;
  }

  exports.bindings[name] = fn;
};

/**
 * Middleware
 * @param {Function} fn
 * @api public
 */

exports.use = function(fn) {
  fn(exports);
  return this;
};

/**
 * Initialize a reactive template for `el` and `obj`.
 *
 * @param {Element} el
 * @param {Element} obj
 * @param {Object} options
 * @api public
 */

function Reactive(el, model, view) {
  if (!(this instanceof Reactive)) return new Reactive(el, model, view);
  this.adapter = exports.adapter;
  this.el = el;
  this.model = model;
  this.els = [];
  this.view = view || {};
  this.bindAll();
  this.bindInterpolation(this.el, []);
}

/**
 * Subscribe to changes on `prop`.
 *
 * @param {String} prop
 * @param {Function} fn
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.sub = function(prop, fn){
  this.adapter.subscribe(this.model, prop, fn);
  return this;
};

/**
 * Unsubscribe to changes from `prop`.
 *
 * @param {String} prop
 * @param {Function} fn
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.unsub = function(prop, fn){
  this.adapter.unsubscribe(this.model, prop, fn);
  return this;
};

/**
 * Get a `prop`
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

Reactive.prototype.get = function(prop) {
  return this.adapter.get(this.model, prop);
};

/**
 * Set a `prop`
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.set = function(prop, val) {
  this.adapter.set(this.model, prop, val);
  return this;
};

/**
 * Traverse and bind all interpolation within attributes and text.
 *
 * @param {Element} el
 * @api private
 */

Reactive.prototype.bindInterpolation = function(el, els){

  // element
  if (el.nodeType == 1) {
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      if (utils.hasInterpolation(attr.value)) {
        new AttrBinding(this, el, attr);
      }
    }
  }

  // text node
  if (el.nodeType == 3) {
    if (utils.hasInterpolation(el.data)) {
      debug('bind text "%s"', el.data);
      new TextBinding(this, el);
    }
  }

  // walk nodes
  for (var i = 0; i < el.childNodes.length; i++) {
    var node = el.childNodes[i];
    this.bindInterpolation(node, els);
  }
};

/**
 * Apply all bindings.
 *
 * @api private
 */

Reactive.prototype.bindAll = function() {
  for (var name in exports.bindings) {
    this.bind(name, exports.bindings[name]);
  }
};

/**
 * Bind `name` to `fn`.
 *
 * @param {String|Object} name or object
 * @param {Function} fn
 * @api public
 */

Reactive.prototype.bind = function(name, fn) {
  if ('object' == typeof name) {
    for (var key in name) {
      this.bind(key, name[key]);
    }
    return;
  }

  var els = query.all('[' + name + ']', this.el);
  if (this.el.hasAttribute && this.el.hasAttribute(name)) {
    els = [].slice.call(els);
    els.unshift(this.el);
  }
  if (!els.length) return;

  debug('bind [%s] (%d elements)', name, els.length);
  for (var i = 0; i < els.length; i++) {
    var binding = new Binding(name, this, els[i], fn);
    binding.bind();
  }
};

/**
 * Use middleware
 *
 * @api public
 */

Reactive.prototype.use = function(fn) {
  fn(this);
  return this;
};

// bundled bindings

exports.use(bindings);

});
require.register("ianstormtaylor-reactive/lib/utils.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:utils');
var props = require('props');
var adapter = require('./adapter');

/**
 * Function cache.
 */

var cache = {};

/**
 * Return interpolation property names in `str`,
 * for example "{foo} and {bar}" would return
 * ['foo', 'bar'].
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

exports.interpolationProps = function(str) {
  var m;
  var arr = [];
  var re = /\{([^}]+)\}/g;

  while (m = re.exec(str)) {
    var expr = m[1];
    arr = arr.concat(props(expr));
  }

  return unique(arr);
};

/**
 * Interpolate `str` with the given `fn`.
 *
 * @param {String} str
 * @param {Function} fn
 * @return {String}
 * @api private
 */

exports.interpolate = function(str, fn){
  return str.replace(/\{([^}]+)\}/g, function(_, expr){
    var cb = cache[expr];
    if (!cb) cb = cache[expr] = compile(expr);
    var val = fn(expr.trim(), cb);
    return val == null ? '' : val;
  });
};

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

exports.hasInterpolation = function(str) {
  return ~str.indexOf('{');
};

/**
 * Remove computed properties notation from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.clean = function(str) {
  return str.split('<')[0].trim();
};

/**
 * Call `prop` on `model` or `view`.
 *
 * @param {Object} model
 * @param {Object} view
 * @param {String} prop
 * @return {Mixed}
 * @api private
 */

exports.call = function(model, view, prop){
  // view method
  if ('function' == typeof view[prop]) {
    return view[prop]();
  }

  // view value
  if (view.hasOwnProperty(prop)) {
    return view[prop];
  }

  // get property from model
  return adapter.get(model, prop);
};

/**
 * Compile `expr` to a `Function`.
 *
 * @param {String} expr
 * @return {Function}
 * @api private
 */

function compile(expr) {
  // TODO: use props() callback instead
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  var p = props(expr);

  var body = expr.replace(re, function(_) {
    if ('(' == _[_.length - 1]) return access(_);
    if (!~p.indexOf(_)) return _;
    return call(_);
  });

  debug('compile `%s`', body);
  return new Function('model', 'view', 'call', 'return ' + body);
}

/**
 * Access a method `prop` with dot notation.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

function access(prop) {
  prop = prop.replace('(', '');
  return '(view.' + prop + ' '
    + '? view '
    + ': model).' + prop + '(';
}

/**
 * Call `prop` on view, model, or access the model's property.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

function call(prop) {
  return 'call(model, view, "' + prop + '")';
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

});
require.register("ianstormtaylor-reactive/lib/text-binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:text-binding');
var utils = require('./utils');

/**
 * Expose `TextBinding`.
 */

module.exports = TextBinding;

/**
 * Initialize a new text binding.
 *
 * @param {Reactive} view
 * @param {Element} node
 * @param {Attribute} attr
 * @api private
 */

function TextBinding(reactive, node) {
  this.reactive = reactive;
  this.text = node.data;
  this.node = node;
  this.props = utils.interpolationProps(this.text);
  this.subscribe();
  this.render();
}

/**
 * Subscribe to changes.
 */

TextBinding.prototype.subscribe = function(){
  var self = this;
  var reactive = this.reactive;
  this.props.forEach(function(prop){
    reactive.sub(prop, function(){
      self.render();
    });
  });
};

/**
 * Render text.
 */

TextBinding.prototype.render = function(){
  var node = this.node;
  var text = this.text;
  var reactive = this.reactive;
  var model = reactive.model;

  // TODO: delegate most of this to `Reactive`
  debug('render "%s"', text);
  node.data = utils.interpolate(text, function(prop, fn){
    if (fn) {
      return fn(model, reactive.view, utils.call);
    } else {
      return reactive.get(model, prop);
    }
  });
};

});
require.register("ianstormtaylor-reactive/lib/attr-binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:attr-binding');
var utils = require('./utils');

/**
 * Expose `AttrBinding`.
 */

module.exports = AttrBinding;

/**
 * Initialize a new attribute binding.
 *
 * @param {Reactive} view
 * @param {Element} node
 * @param {Attribute} attr
 * @api private
 */

function AttrBinding(reactive, node, attr) {
  var self = this;
  this.reactive = reactive;
  this.node = node;
  this.attr = attr;
  this.text = attr.value;
  this.props = utils.interpolationProps(this.text);
  this.subscribe();
  this.render();
}

/**
 * Subscribe to changes.
 */

AttrBinding.prototype.subscribe = function(){
  var self = this;
  var reactive = this.reactive;
  this.props.forEach(function(prop){
    reactive.sub(prop, function(){
      self.render();
    });
  });
};

/**
 * Render the value.
 */

AttrBinding.prototype.render = function(){
  var attr = this.attr;
  var text = this.text;
  var reactive = this.reactive;
  var model = reactive.model;

  // TODO: delegate most of this to `Reactive`
  debug('render %s "%s"', attr.name, text);
  attr.value = utils.interpolate(text, function(prop, fn){
    if (fn) {
      return fn(model, reactive.view, utils.call);
    } else {
      return reactive.get(model, prop);
    }
  });
};

});
require.register("ianstormtaylor-reactive/lib/binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var parse = require('format-parser');

/**
 * Expose `Binding`.
 */

module.exports = Binding;

/**
 * Initialize a binding.
 *
 * @api private
 */

function Binding(name, reactive, el, fn) {
  this.name = name;
  this.reactive = reactive;
  this.model = reactive.model;
  this.view = reactive.view;
  this.el = el;
  this.fn = fn;
}

/**
 * Apply the binding.
 *
 * @api private
 */

Binding.prototype.bind = function() {
  var val = this.el.getAttribute(this.name);
  this.fn(this.el, val, this.model);
};

/**
 * Perform interpolation on `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Binding.prototype.interpolate = function(name) {
  var self = this;
  name = clean(name);

  if (~name.indexOf('{')) {
    return name.replace(/{([^}]+)}/g, function(_, name){
      return self.value(name);
    });
  }

  return this.formatted(name);
};

/**
 * Return value for property `name`.
 *
 *  - check if the "view" has a `name` method
 *  - check if the "model" has a `name` method
 *  - check if the "model" has a `name` property
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

Binding.prototype.value = function(name) {
  var view = this.view;
  name = clean(name);

  // view method
  if ('function' == typeof view[name]) {
    return view[name]();
  }

  // view value
  if (view.hasOwnProperty(name)) {
    return view[name];
  }

  return this.reactive.get(name);
};

/**
 * Return formatted property.
 *
 * @param {String} fmt
 * @return {Mixed}
 * @api public
 */

Binding.prototype.formatted = function(fmt) {
  var calls = parse(clean(fmt));
  var name = calls[0].name;
  var val = this.value(name);

  for (var i = 1; i < calls.length; ++i) {
    var call = calls[i];
    call.args.unshift(val);
    var fn = this.view[call.name];
    val = fn.apply(this.view, call.args);
  }

  return val;
};

/**
 * Invoke `fn` on changes.
 *
 * @param {Function} fn
 * @api public
 */

Binding.prototype.change = function(fn) {
  fn.call(this);

  var self = this;
  var reactive = this.reactive;
  var val = this.el.getAttribute(this.name);

  // computed props
  var parts = val.split('<');
  val = parts[0];
  var computed = parts[1];
  if (computed) computed = computed.trim().split(/\s+/);

  // interpolation
  if (hasInterpolation(val)) {
    var props = interpolationProps(val);
    props.forEach(function(prop){
      reactive.sub(prop, fn.bind(self));
    });
    return;
  }

  // formatting
  var calls = parse(val);
  var prop = calls[0].name;

  // computed props
  if (computed) {
    computed.forEach(function(prop){
      reactive.sub(prop, fn.bind(self));
    });
    return;
  }

  // bind to prop
  reactive.sub(prop, fn.bind(this));
};

/**
 * Return interpolation property names in `str`,
 * for example "{foo} and {bar}" would return
 * ['foo', 'bar'].
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function interpolationProps(str) {
  var m;
  var arr = [];
  var re = /\{([^}]+)\}/g;
  while (m = re.exec(str)) {
    arr.push(m[1]);
  }
  return arr;
}

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function hasInterpolation(str) {
  return ~str.indexOf('{');
}

/**
 * Remove computed properties notation from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function clean(str) {
  return str.split('<')[0].trim();
}

});
require.register("ianstormtaylor-reactive/lib/bindings.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var classes = require('classes');
var event = require('event');

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'name',
  'href',
  'title',
  'class',
  'style',
  'width',
  'value',
  'height',
  'tabindex',
  'placeholder'
];

/**
 * Events supported.
 */

var events = [
  'change',
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'blur',
  'focus',
  'input',
  'submit',
  'keydown',
  'keypress',
  'keyup'
];

/**
 * Apply bindings.
 */

module.exports = function(reactive){

  /**
   * Generate attribute bindings.
   */

  attrs.forEach(function(attr){
    reactive.bind('data-' + attr, function(el, name, obj){
      this.change(function(){
        el.setAttribute(attr, this.interpolate(name));
      });
    });
  });

  /**
   * Show binding.
   */

  reactive.bind('data-visible', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        classes(el).add('visible').remove('hidden');
      } else {
        classes(el).remove('visible').add('hidden');
      }
    });
  });

  /**
   * Hide binding.
   */

  reactive.bind('data-hidden', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        classes(el).remove('visible').add('hidden');
      } else {
        classes(el).add('visible').remove('hidden');
      }
    });
  });

  /**
   * Checked binding.
   */

  reactive.bind('data-checked', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        el.setAttribute('checked', 'checked');
      } else {
        el.removeAttribute('checked');
      }
    });
  });

  /**
   * Text binding.
   */

  reactive.bind('data-text', function(el, name){
    this.change(function(){
      el.textContent = this.interpolate(name);
    });
  });

  /**
   * HTML binding.
   */

  reactive.bind('data-html', function(el, name){
    this.change(function(){
      el.innerHTML = this.formatted(name);
    });
  });

  /**
   * Generate event bindings.
   */

  events.forEach(function(name){
    reactive.bind('on-' + name, function(el, method){
      var view = this.reactive.view;
      event.bind(el, name, function(e){
        var fn = view[method];
        if (!fn) throw new Error('method .' + method + '() missing');
        view[method](e);
      });
    });
  });

  /**
   * Conditional binding.
   */

  reactive.bind('data-if', function(el, name){
    var value = this.value(name);
    if (!value) el.parentNode.removeChild(el);
  });

  /**
   * Append child element.
   */

  reactive.bind('data-append', function(el, name){
    var other = this.value(name);
    el.appendChild(other);
  });

  /**
   * Replace element.
   */

  reactive.bind('data-replace', function(el, name){
    var other = this.value(name);

    // carryover attributes
    for (var key in el.attributes) {
      var attr = el.attributes[key];
      if (!attr.specified || 'class' == attr.name) continue;
      if (!other.hasAttribute(attr.name)) other.setAttribute(attr.name, attr.value);
    }

    // carryover classes
    var arr = classes(el).array();
    for (var i = 0; i < arr.length; i++) {
      classes(other).add(arr[i]);
    }

    el.parentNode.replaceChild(other, el);
  });

};

});
require.register("ianstormtaylor-reactive/lib/adapter.js", function(exports, require, module){
/**
 * Default subscription method.
 * Subscribe to changes on the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Function} fn
 */

exports.subscribe = function(obj, prop, fn) {
  if (!obj.on) return;
  obj.on('change ' + prop, fn);
};

/**
 * Default unsubscription method.
 * Unsubscribe from changes on the model.
 */

exports.unsubscribe = function(obj, prop, fn) {
  if (!obj.off) return;
  obj.off('change ' + prop, fn);
};

/**
 * Default setter method.
 * Set a property on the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Mixed} val
 */

exports.set = function(obj, prop, val) {
  if ('function' == typeof obj[prop]) {
    obj[prop](val);
  } else {
    obj[prop] = val;
  }
};

/**
 * Default getter method.
 * Get a property from the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Mixed}
 */

exports.get = function(obj, prop) {
  if ('function' == typeof obj[prop]) {
    return obj[prop]();
  } else {
    return obj[prop];
  }
};

});
require.register("component-type/index.js", function(exports, require, module){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  return typeof val.valueOf();
};

});
require.register("jkroso-classes/index.js", function(exports, require, module){

module.exports = document.createElement('div').classList
  ? require('./modern')
  : require('./fallback')
});
require.register("jkroso-classes/fallback.js", function(exports, require, module){

var index = require('indexof')

exports.add = function(name, el){
	var arr = exports.array(el)
	if (index(arr, name) < 0) {
		arr.push(name)
		el.className = arr.join(' ')
	}
}

exports.remove = function(name, el){
	if (name instanceof RegExp) {
		return exports.removeMatching(name, el)
	}
	var arr = exports.array(el)
	var i = index(arr, name)
	if (i >= 0) {
		arr.splice(i, 1)
		el.className = arr.join(' ')
	}
}

exports.removeMatching = function(re, el){
	var arr = exports.array(el)
	for (var i = 0; i < arr.length;) {
		if (re.test(arr[i])) arr.splice(i, 1)
		else i++
	}
	el.className = arr.join(' ')
}

exports.toggle = function(name, el){
	if (exports.has(name, el)) {
		exports.remove(name, el)
	} else {
		exports.add(name, el)
	}
}

exports.array = function(el){
	return el.className.match(/([^\s]+)/g) || []
}

exports.has =
exports.contains = function(name, el){
	return index(exports.array(el), name) >= 0
}
});
require.register("jkroso-classes/modern.js", function(exports, require, module){

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @param {Element} el
 * @api public
 */

exports.add = function(name, el){
	el.classList.add(name)
}

/**
 * Remove `name` if present
 *
 * @param {String|RegExp} name
 * @param {Element} el
 * @api public
 */

exports.remove = function(name, el){
	if (name instanceof RegExp) {
		return exports.removeMatching(name, el)
	}
	el.classList.remove(name)
}

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @param {Element} el
 * @api public
 */

exports.removeMatching = function(re, el){
	var arr = exports.array(el)
	for (var i = 0; i < arr.length; i++) {
		if (re.test(arr[i])) el.classList.remove(arr[i])
	}
}

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @param {Element} el
 * @api public
 */

exports.toggle = function(name, el){
	el.classList.toggle(name)
}

/**
 * Return an array of classes.
 *
 * @param {Element} el
 * @return {Array}
 * @api public
 */

exports.array = function(el){
	return el.className.match(/([^\s]+)/g) || []
}

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @param {Element} el
 * @api public
 */

exports.has =
exports.contains = function(name, el){
	return el.classList.contains(name)
}
});
require.register("ianstormtaylor-classes/index.js", function(exports, require, module){

var classes = require('classes');


/**
 * Expose `mixin`.
 */

module.exports = exports = mixin;


/**
 * Mixin the classes methods.
 *
 * @param {Object} object
 * @return {Object}
 */

function mixin (obj) {
  for (var method in exports) obj[method] = exports[method];
  return obj;
}


/**
 * Add a class.
 *
 * @param {String} name
 * @return {Object}
 */

exports.addClass = function (name) {
  classes.add(name, this.el);
  return this;
};


/**
 * Remove a class.
 *
 * @param {String} name
 * @return {Object}
 */

exports.removeClass = function (name) {
  classes.remove(name, this.el);
  return this;
};


/**
 * Has a class?
 *
 * @param {String} name
 * @return {Boolean}
 */

exports.hasClass = function (name) {
  return classes.has(name, this.el);
};


/**
 * Toggle a class.
 *
 * @param {String} name
 * @return {Object}
 */

exports.toggleClass = function (name) {
  classes.toggle(name, this.el);
  return this;
};

});
require.register("segmentio-view/lib/index.js", function(exports, require, module){

var domify = require('domify');
var protos = require('./protos');
var reactive = require('reactive');
var statics = require('./statics');
var type = require('type');


/**
 * Expose `createView`.
 */

module.exports = createView;


/**
 * Create a new view constructor with the given `template`.
 * Optional `fn` will be assigned to `construct` events.
 *
 * @param {String or Function} template
 * @param {Function} [fn]
 * @return {Function}
 */

function createView (template, fn) {
  if (!template) throw new Error('template required');

  /**
   * Initialize a new `View` with an optional `model`, `el` and `options`.
   *
   * @param {Object} model (optional)
   * @param {Element} el (optional)
   * @param {Object} options (optional)
   */

  function View (model, el, options) {
    options = options || {};
    if ('object' == type(el)) options = el, el = null;
    if ('element' == type(model)) options = el, el = model, model = null;

    this.model = model || {};
    this.el = el || domify(
      'function' == type(this.template)
        ? this.template(this.model)
        : this.template
      );
    this.options = options;
    this.reactive = reactive(this.el, this.model, this);
    this.View.emit('construct', this, this.model, this.el, this.options);
  }

  View.prototype.template = template;
  View.prototype.View = View;
  for (var key in statics) View[key] = statics[key];
  for (var key in protos) View.prototype[key] = protos[key];

  // assign optional `construct` listener
  if (fn) View.on('construct', fn);

  return View;
}
});
require.register("segmentio-view/lib/protos.js", function(exports, require, module){

var Classes = require('classes');
var Emitter = require('emitter');


/**
 * Mixin emitter.
 */

Emitter(exports);


/**
 * Mixin classes.
 */

Classes(exports);


/**
 * Convenience shortcut for `querySelector`.
 *
 * @param {String} selector
 * @return {Element or Null}
 */

exports.find = function (selector) {
  return this.el.querySelector(selector);
};


/**
 * Convenient shortcut for `querySelectorAll`.
 *
 * @param {String} selector
 * @return {NodeList or Null}
 */

exports.findAll = function (selector) {
  return this.el.querySelectorAll(selector);
};
});
require.register("segmentio-view/lib/statics.js", function(exports, require, module){

var Emitter = require('emitter');


/**
 * Mixin emitter.
 */

Emitter(exports);
});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type = require('type');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}
});
require.register("config/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var each = require('each');

/**
 * Expose `getters` for config vars
 */

each(window.CONFIG, function(key, val) {
  var g = function() {
    return val;
  };
  module.exports[key] = g;
  module.exports[key.toLowerCase()] = g;
});

});
require.register("manager-nav/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var template = require('./template.html');
var config = require('config');
var create = require('view');

/**
 * Nav
 */

var Nav = module.exports = create(template);

/**
 * Name
 */

Nav.prototype.name = function() {
  return config.name();
};

/**
 * Is admin?
 */

Nav.prototype.isAdmin = function() {
  return this.model.isAdmin();
};

/**
 * Is authed?
 */

Nav.prototype.isLoggedIn = function() {
  return this.model.isLoggedIn();
};

});
require.register("404-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':404-page');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

});
require.register("alert/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var template = require('./template.html');
var create = require('view');

/**
 * Expose `Alert`
 */

var Alert = module.exports = create(template, function(alert) {
  document.getElementById('alerts').appendChild(alert.el);
});

/**
 * Dispose
 */

Alert.prototype.dispose = function(e) {
  e.preventDefault();
  this.off();
  this.el.remove();
};

});
require.register("alerts/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var Alert = require('alert');
var config = require('config');
var debug = require('debug')(config.name() + ':alerts');
var domify = require('domify');
var each = require('each');
var template = require('./template.html');

/**
 * Alerts
 */

var alerts = [];

/**
 * Append el
 */

document.body.insertBefore(domify(template), document.body.firstChild);

/**
 * Expose `render` middleware
 */

module.exports = function(ctx, next) {
  debug('displaying');

  // remove all alerts
  var el = document.getElementById('alerts');
  el.innerHTML = '';

  // create all alerts in local storage
  each(alerts, function(info) {
    new Alert(info);
  });

  // reset local storage
  alerts = [];

  // create all alerts in the query parameters
  each(ctx.query, function(name, val) {
    switch (name) {
      case 'danger':
      case 'info':
      case 'success':
      case 'warning':
        new Alert({
          type: name,
          text: val
        });
        break;
    }
  });

  next();
};

/**
 * Push
 */

module.exports.push = function(info) {
  alerts = [info].concat(alerts);
};

/**
 * Show
 */

module.exports.show = function(info) {
  return new Alert(info);
};

});
require.register("analytics/index.js", function(exports, require, module){
module.exports = window.analytics;

});
require.register("component-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("visionmedia-superagent/lib/client.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.register("ianstormtaylor-to-no-case/index.js", function(exports, require, module){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
});
require.register("ianstormtaylor-to-space-case/index.js", function(exports, require, module){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
});
require.register("ianstormtaylor-to-camel-case/index.js", function(exports, require, module){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
});
require.register("component-within-document/index.js", function(exports, require, module){

/**
 * Check if `el` is within the document.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

module.exports = function(el) {
  var node = el;
  while (node = node.parentNode) {
    if (node == document) return true;
  }
  return false;
};
});
require.register("component-css/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css');
var set = require('./lib/style');
var get = require('./lib/css');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * Get and set css values
 *
 * @param {Element} el
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Element} el
 * @api public
 */

function css(el, prop, val) {
  if (!el) return;

  if (undefined !== val) {
    var obj = {};
    obj[prop] = val;
    debug('setting styles %j', obj);
    return setStyles(el, obj);
  }

  if ('object' == typeof prop) {
    debug('setting styles %j', prop);
    return setStyles(el, prop);
  }

  debug('getting %s', prop);
  return get(el, prop);
}

/**
 * Set the styles on an element
 *
 * @param {Element} el
 * @param {Object} props
 * @return {Element} el
 */

function setStyles(el, props) {
  for (var prop in props) {
    set(el, prop, props[prop]);
  }

  return el;
}

});
require.register("component-css/lib/css.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:css');
var camelcase = require('to-camel-case');
var computed = require('./computed');
var property = require('./prop');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * CSS Normal Transforms
 */

var cssNormalTransform = {
  letterSpacing: 0,
  fontWeight: 400
};

/**
 * Get a CSS value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Array} styles
 * @return {String}
 */

function css(el, prop, extra, styles) {
  var hooks = require('./hooks');
  var orig = camelcase(prop);
  var style = el.style;
  var val;

  prop = property(prop, style);
  var hook = hooks[prop] || hooks[orig];

  // If a hook was provided get the computed value from there
  if (hook && hook.get) {
    debug('get hook provided. use that');
    val = hook.get(el, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (undefined == val) {
    debug('fetch the computed value of %s', prop);
    val = computed(el, prop);
  }

  if ('normal' == val && cssNormalTransform[prop]) {
    val = cssNormalTransform[prop];
    debug('normal => %s', val);
  }

  // Return, converting to number if forced or a qualifier was provided and val looks numeric
  if ('' == extra || extra) {
    debug('converting value: %s into a number');
    var num = parseFloat(val);
    return true === extra || isNumeric(num) ? num || 0 : val;
  }

  return val;
}

/**
 * Is Numeric
 *
 * @param {Mixed} obj
 * @return {Boolean}
 */

function isNumeric(obj) {
  return !isNan(parseFloat(obj)) && isFinite(obj);
}

});
require.register("component-css/lib/prop.js", function(exports, require, module){
/**
 * Module dependencies
 */

var debug = require('debug')('css:prop');
var camelcase = require('to-camel-case');
var vendor = require('./vendor');

/**
 * Export `prop`
 */

module.exports = prop;

/**
 * Normalize Properties
 */

var cssProps = {
  'float': 'cssFloat' in document.body.style ? 'cssFloat' : 'styleFloat'
};

/**
 * Get the vendor prefixed property
 *
 * @param {String} prop
 * @param {String} style
 * @return {String} prop
 * @api private
 */

function prop(prop, style) {
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
  debug('transform property: %s => %s');
  return prop;
}

});
require.register("component-css/lib/swap.js", function(exports, require, module){
/**
 * Export `swap`
 */

module.exports = swap;

/**
 * Initialize `swap`
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Function} fn
 * @param {Array} args
 * @return {Mixed}
 */

function swap(el, options, fn, args) {
  // Remember the old values, and insert the new ones
  for (var key in options) {
    old[key] = el.style[key];
    el.style[key] = options[key];
  }

  ret = fn.apply(el, args || []);

  // Revert the old values
  for (key in options) {
    el.style[key] = old[key];
  }

  return ret;
}

});
require.register("component-css/lib/style.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:style');
var camelcase = require('to-camel-case');
var support = require('./support');
var property = require('./prop');
var hooks = require('./hooks');

/**
 * Expose `style`
 */

module.exports = style;

/**
 * Possibly-unitless properties
 *
 * Don't automatically add 'px' to these properties
 */

var cssNumber = {
  "columnCount": true,
  "fillOpacity": true,
  "fontWeight": true,
  "lineHeight": true,
  "opacity": true,
  "order": true,
  "orphans": true,
  "widows": true,
  "zIndex": true,
  "zoom": true
};

/**
 * Set a css value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} val
 * @param {Mixed} extra
 */

function style(el, prop, val, extra) {
  // Don't set styles on text and comment nodes
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;

  var orig = camelcase(prop);
  var style = el.style;
  var type = typeof val;

  if (!val) return get(el, prop, orig, extra);

  prop = property(prop, style);

  var hook = hooks[prop] || hooks[orig];

  // If a number was passed in, add 'px' to the (except for certain CSS properties)
  if ('number' == type && !cssNumber[orig]) {
    debug('adding "px" to end of number');
    val += 'px';
  }

  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
  // but it would mean to define eight (for every problematic property) identical functions
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
    debug('set property (%s) value to "inherit"', prop);
    style[prop] = 'inherit';
  }

  // If a hook was provided, use that value, otherwise just set the specified value
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
    // Support: Chrome, Safari
    // Setting style to blank string required to delete "style: x !important;"
    debug('set hook defined. setting property (%s) to %s', prop, val);
    style[prop] = '';
    style[prop] = val;
  }

}

/**
 * Get the style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {String} orig
 * @param {Mixed} extra
 * @return {String}
 */

function get(el, prop, orig, extra) {
  var style = el.style;
  var hook = hooks[prop] || hooks[orig];
  var ret;

  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
    debug('get hook defined, returning: %s', ret);
    return ret;
  }

  ret = style[prop];
  debug('getting %s', ret);
  return ret;
}

});
require.register("component-css/lib/hooks.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var each = require('each');
var css = require('./css');
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
var styles = require('./styles');
var support = require('./support');
var swap = require('./swap');
var computed = require('./computed');
var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

/**
 * Height & Width
 */

each(['width', 'height'], function(name) {
  exports[name] = {};

  exports[name].get = function(el, compute, extra) {
    if (!compute) return;
    // certain elements can have dimension info if we invisibly show them
    // however, it must have a current display style that would benefit from this
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })
      : getWidthOrHeight(el, name, extra);
  }

  exports[name].set = function(el, val, extra) {
    var styles = extra && styles(el);
    return setPositiveNumber(el, val, extra
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)
      : 0
    );
  };

});

/**
 * Opacity
 */

exports.opacity = {};
exports.opacity.get = function(el, compute) {
  if (!compute) return;
  var ret = computed(el, 'opacity');
  return '' == ret ? '1' : ret;
}

/**
 * Utility: Set Positive Number
 *
 * @param {Element} el
 * @param {Mixed} val
 * @param {Number} subtract
 * @return {Number}
 */

function setPositiveNumber(el, val, subtract) {
  var matches = rnumsplit.exec(val);
  return matches ?
    // Guard against undefined 'subtract', e.g., when used as in cssHooks
    Math.max(0, matches[1]) + (matches[2] || 'px') :
    val;
}

/**
 * Utility: Get the width or height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @return {String}
 */

function getWidthOrHeight(el, prop, extra) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true;
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;
  var styles = computed(el);
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if (val <= 0 || val == null) {
    // Fall back to computed then uncomputed css if necessary
    val = computed(el, prop, styles);

    if (val < 0 || val == null) {
      val = el.style[prop];
    }

    // Computed unit is not pixels. Stop here and return.
    if (rnumnonpx.test(val)) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable el.style
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);

    // Normalize ', auto, and prepare for extra
    val = parseFloat(val) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  extra = extra || (isBorderBox ? 'border' : 'content');
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);
  return val + 'px';
}

/**
 * Utility: Augment the width or the height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Boolean} isBorderBox
 * @param {Array} styles
 */

function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {
  // If we already have the right measurement, avoid augmentation,
  // Otherwise initialize for horizontal or vertical properties
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;
  var val = 0;

  for (; i < 4; i += 2) {
    // both box models exclude margin, so add it if we want it
    if (extra === 'margin') {
      val += css(el, extra + cssExpand[i], true, styles);
    }

    if (isBorderBox) {
      // border-box includes padding, so remove it if we want content
      if (extra === 'content') {
        val -= css(el, 'padding' + cssExpand[i], true, styles);
      }

      // at this point, extra isn't border nor margin, so remove border
      if (extra !== 'margin') {
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += css(el, 'padding' + cssExpand[i], true, styles);

      // at this point, extra isn't content nor padding, so add border
      if (extra !== 'padding') {
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    }
  }

  return val;
}

});
require.register("component-css/lib/styles.js", function(exports, require, module){
/**
 * Expose `styles`
 */

module.exports = styles;

/**
 * Get all the styles
 *
 * @param {Element} el
 * @return {Array}
 */

function styles(el) {
  if (window.getComputedStyle) {
    return el.ownerDocument.defaultView.getComputedStyle(el, null);
  } else {
    return el.currentStyle;
  }
}

});
require.register("component-css/lib/vendor.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var prefixes = ['Webkit', 'O', 'Moz', 'ms'];

/**
 * Expose `vendor`
 */

module.exports = vendor;

/**
 * Get the vendor prefix for a given property
 *
 * @param {String} prop
 * @param {Object} style
 * @return {String}
 */

function vendor(prop, style) {
  // shortcut for names that are not vendor prefixed
  if (style[prop]) return prop;

  // check for vendor prefixed names
  var capName = prop[0].toUpperCase() + prop.slice(1);
  var original = prop;
  var i = prefixes.length;

  while (i--) {
    prop = prefixes[i] + capName;
    if (prop in style) return prop;
  }

  return original;
}

});
require.register("component-css/lib/support.js", function(exports, require, module){
/**
 * Support values
 */

var reliableMarginRight;
var boxSizingReliableVal;
var pixelPositionVal;
var clearCloneStyle;

/**
 * Container setup
 */

var docElem = document.documentElement;
var container = document.createElement('div');
var div = document.createElement('div');

/**
 * Clear clone style
 */

div.style.backgroundClip = 'content-box';
div.cloneNode(true).style.backgroundClip = '';
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';

container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
container.appendChild(div);

/**
 * Pixel position
 *
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
 * getComputedStyle returns percent when specified for top/left/bottom/right
 * rather than make the css module depend on the offset module, we just check for it here
 */

exports.pixelPosition = function() {
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
  return pixelPositionVal;
}

/**
 * Reliable box sizing
 */

exports.boxSizingReliable = function() {
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
  return boxSizingReliableVal;
}

/**
 * Reliable margin right
 *
 * Support: Android 2.3
 * Check if div with explicit width and no margin-right incorrectly
 * gets computed margin-right based on width of container. (#3333)
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
 * This support function is only executed once so no memoizing is needed.
 *
 * @return {Boolean}
 */

exports.reliableMarginRight = function() {
  var ret;
  var marginDiv = div.appendChild(document.createElement("div" ));

  marginDiv.style.cssText = div.style.cssText = divReset;
  marginDiv.style.marginRight = marginDiv.style.width = "0";
  div.style.width = "1px";
  docElem.appendChild(container);

  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

  docElem.removeChild(container);

  // Clean up the div for other support tests.
  div.innerHTML = "";

  return ret;
}

/**
 * Executing both pixelPosition & boxSizingReliable tests require only one layout
 * so they're executed at the same time to save the second computation.
 */

function computePixelPositionAndBoxSizingReliable() {
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
    "position:absolute;top:1%";
  docElem.appendChild(container);

  var divStyle = window.getComputedStyle(div, null);
  pixelPositionVal = divStyle.top !== "1%";
  boxSizingReliableVal = divStyle.width === "4px";

  docElem.removeChild(container);
}



});
require.register("component-css/lib/computed.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:computed');
var withinDocument = require('within-document');
var styles = require('./styles');

/**
 * Expose `computed`
 */

module.exports = computed;

/**
 * Get the computed style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Array} precomputed (optional)
 * @return {Array}
 * @api private
 */

function computed(el, prop, precomputed) {
  var computed = precomputed || styles(el);
  var ret;
  
  if (!computed) return;

  if (computed.getPropertyValue) {
    ret = computed.getPropertyValue(prop) || computed[prop];
  } else {
    ret = computed[prop];
  }

  if ('' === ret && !withinDocument(el)) {
    debug('element not within document, try finding from style attribute');
    var style = require('./style');
    ret = style(el, prop);
  }

  debug('computed value of %s: %s', prop, ret);

  // Support: IE
  // IE returns zIndex value as an integer.
  return undefined === ret ? ret : ret + '';
}

});
require.register("component-autoscale-canvas/index.js", function(exports, require, module){

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
});
require.register("component-raf/index.js", function(exports, require, module){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

});
require.register("component-has-canvas/index.js", function(exports, require, module){

/**
 * Export `bool`
 */

module.exports = (function(){
  var el = document.createElement('canvas');
  return !! el.getContext;
})();

});
require.register("matthewp-text/index.js", function(exports, require, module){

var text = 'innerText' in document.createElement('div')
  ? 'innerText'
  : 'textContent'

module.exports = function (el, val) {
  if (val == null) return el[text];
  el[text] = val;
};

});
require.register("component-spinner/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var autoscale = require('autoscale-canvas');
var raf = require('raf');
var text = require('text');
var supported = require('canvas');

/**
 * Expose `Spinner`.
 */

module.exports = Spinner;

/**
 * Initialize a new `Spinner`.
 */

function Spinner() {
  var self = this;
  this.percent = 0;

  if (supported) {
    this.el = document.createElement('canvas');
    this.el.className = 'spinner';
  } else {
    this.el = document.createElement('div');
    this.el.className = 'spinner fallback';
    return;
  }

  this.ctx = this.el.getContext('2d');
  this.size(50);
  this.fontSize(11);
  this.speed(60);
  this.font('helvetica, arial, sans-serif');
  this.stopped = false;

  (function animate() {
    if (self.stopped) return;
    raf(animate);
    self.percent = (self.percent + self._speed / 36) % 100;
    self.draw(self.ctx);
  })();
}

/**
 * Stop the animation.
 *
 * @api public
 */

Spinner.prototype.stop = function(){
  this.stopped = true;
};

/**
 * Set spinner size to `n`.
 *
 * @param {Number} n
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.size = function(n){
  this.el.width = n;
  this.el.height = n;
  if (supported) autoscale(this.el);
  return this;
};

/**
 * Set text to `str`.
 *
 * @param {String} str
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.text = function(str){
  this._text = str;
  if (!supported) text(this.el, str);
  return this;
};

/**
 * Set font size to `n`.
 *
 * @param {Number} n
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.fontSize = function(n){
  this._fontSize = n;
  return this;
};

/**
 * Set font `family`.
 *
 * @param {String} family
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.font = function(family){
  this._font = family;
  return this;
};

/**
 * Set speed to `n` rpm.
 *
 * @param {Number} n
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.speed = function(n) {
  this._speed = n;
  return this;
};

/**
 * Make the spinner light colored.
 *
 * @return {Spinner}
 * @api public
 */

Spinner.prototype.light = function(){
  this._light = true;
  return this;
};

/**
 * Draw on `ctx`.
 *
 * @param {CanvasRenderingContext2d} ctx
 * @return {Spinner}
 * @api private
 */

Spinner.prototype.draw = function(ctx){
  var percent = Math.min(this.percent, 100)
    , ratio = window.devicePixelRatio || 1
    , size = this.el.width / ratio
    , half = size / 2
    , x = half
    , y = half
    , rad = half - 1
    , fontSize = this._fontSize
    , light = this._light;

  ctx.font = fontSize + 'px ' + this._font;

  var angle = Math.PI * 2 * (percent / 100);
  ctx.clearRect(0, 0, size, size);

  // outer circle
  var grad = ctx.createLinearGradient(
    half + Math.sin(Math.PI * 1.5 - angle) * half,
    half + Math.cos(Math.PI * 1.5 - angle) * half,
    half + Math.sin(Math.PI * 0.5 - angle) * half,
    half + Math.cos(Math.PI * 0.5 - angle) * half
  );

  // color
  if (light) {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
  } else {
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
  }

  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, rad, angle - Math.PI, angle, false);
  ctx.stroke();

  // inner circle
  ctx.strokeStyle = light ? 'rgba(255, 255, 255, .4)' : '#eee';
  ctx.beginPath();
  ctx.arc(x, y, rad - 1, 0, Math.PI * 2, true);
  ctx.stroke();

  // text
  var text = this._text || ''
    , w = ctx.measureText(text).width;

  if (light) ctx.fillStyle = 'rgba(255, 255, 255, .9)';
  ctx.fillText(
      text
    , x - w / 2 + 1
    , y + fontSize / 2 - 1);

  return this;
};

});
require.register("component-mutation-observer/index.js", function(exports, require, module){

module.exports = window.MutationObserver
  || window.WebKitMutationObserver
  || window.MozMutationObserver;

});
require.register("component-removed/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Observer = require('mutation-observer');

/**
 * Exports the `MutationObserver` based approach, the
 * `MutationEvent` based approach, or the fallback one
 * depending on UA capabilities.
 */

module.exports = Observer
  ? require('./dom4')
  : document.addEventListener
    ? require('./dom3')
    : require('./fallback');

});
require.register("component-removed/fallback.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var withinDocument = require('within-document');

/**
 * Expose `removed`.
 */

exports = module.exports = removed;

/**
 * Default interval.
 */

exports.interval = 200;

/**
 * Watch for removal and invoke `fn(el)`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

function removed(el, fn){
  interval(el, fn);
}

/**
 * Watch for removal with an interval.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function interval(el, fn) {
  var id = setInterval(function(){
    if (el.parentNode && withinDocument(el)) return;
    clearInterval(id);
    fn(el);
  }, exports.interval);
}

});
require.register("component-removed/dom3.js", function(exports, require, module){

module.exports = removed;

/**
 * Watch for removal with a DOM3 MutationEvent.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function removed(el, fn) {
  function cb(mutationEvent) {
    var target = mutationEvent.target
      , children = [].slice.call(target.getElementsByTagName('*'));

    if (target === el || ~children.indexOf(el)) {
      fn(el);
      document.removeEventListener('DOMNodeRemoved', cb);
    }
  }

  document.addEventListener('DOMNodeRemoved', cb);
}

});
require.register("component-removed/dom4.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var withinDoc = require('within-document')
  , Observer = require('mutation-observer');

/**
 * Expose `removed`.
 */

module.exports = removed;

/**
 * Watched elements.
 *
 * @api private
 */

var watched = [];

/**
 * Set up observer.
 *
* @api private
 */

var observer = new Observer(onchanges);

/**
 * Generic observer callback.
 *
 * @api private
 */

function onchanges(changes){
  // keep track of number of found els
  var found = 0;

  for (var i = 0, l = changes.length; i < l; i++) {
    if (changes[i].removedNodes.length) {
      // allow for manipulation of `watched`
      // from within the callback
      var w = watched.slice();

      for (var i2 = 0, l2 = w.length; i2 < l2; i2++) {
        var el = w[i2][0];

        // check that the element is no longer in the dom
        if (!withinDoc(el)) {
          watched.splice(i2 - found++, 1)[0][1]();

          // abort if nothing else left to watch
          if (!watched.length) observer.disconnect();
        }
      }

      // we only need to loop through watched els once
      break;
    }
  }
}

/**
 * Starts observing the DOM.
 *
 * @api private
 */

function observe(){
  var html = document.documentElement;
  observer.observe(html, {
    subtree: true,
    childList: true
  });
}

/**
 * Watches for the removal of `el` from DOM.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function removed(el, fn){
  // reattach observer if we weren't watching
  if (!watched.length) observe();

  // we add it to the list of elements to check
  watched.push([el, fn]);
}

});
require.register("component-spin/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Spinner = require('spinner')
  , debug = require('debug')('spin')
  , css = require('css')
  , removed = require('removed');

/**
 * Add a spinner to `el`,
 * and adjust size and position
 * based on `el`'s box.
 *
 * Options:
 *
 *    - `delay` milliseconds defaulting to 300
 *    - `size` size defaults to 1/5th the parent dimensions
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Spinner}
 * @api public
 */

module.exports = function(el, options){
  if (!el) throw new Error('element required');

  var appended = false;
  var spin = new Spinner(el);
  options = options || {};
  var ms = options.delay || 300;

  // update size and position
  spin.update = function(){
    debug('update');
    var w = el.offsetWidth;
    var h = el.offsetHeight;

    // size
    var s = options.size || w / 5;
    spin.size(s);
    debug('show %dpx (%dms)', s, ms);

    // position
    css(spin.el, {
      position: 'absolute',
      top: h / 2 - s / 2,
      left: w / 2 - s / 2
    });
  }

  spin.update();

  // remove
  spin.remove = function(){
    debug('remove');
    if (appended) el.removeChild(spin.el);
    spin.stop();
    clearTimeout(timer);
  };

  // append
  var timer = setTimeout(function(){
    debug('append');
    appended = true;
    el.appendChild(spin.el);
  }, ms);

  removed(spin.el, function() {
    appended = false;
  });

  return spin;
};
});
require.register("spinner/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var domify = require('domify');
var spin = require('spin');
var template = require('./template.html');

/**
 * Append template to the page
 */

document.body.appendChild(domify(template));

/**
 * Store one spinner at a time
 */

var spinner = null;

/**
 * Store the spinner div
 */

var el = document.getElementById('spinner');

/**
 * Expose `spinner`
 */

module.exports = function() {
  el.style.display = 'block';

  if (spinner) return spinner;
  spinner = spin(el, {
    size: el.offsetWidth / 15
  });

  window.onresize = function() {
    if (spinner) spinner.update();
  };

  var remove = spinner.remove;
  spinner.remove = function() {
    if (spinner) remove.apply(spinner, arguments);
    el.style.display = 'none';
    spinner = null;
  };

  return spinner;
};

});
require.register("request/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':request');
var spin = require('spinner');
var superagent = require('superagent');

/**
 * Base URL
 */

var base = config.api_url();

/**
 * Expose `get`
 */

module.exports.get = function(url, params, callback) {
  if (arguments.length === 2) {
    callback = params;
    params = {};
  }

  var spinner = spin();
  superagent
    .get(base + url)
    .query(params)
    .end(function(err, res) {
      debug('%s GET %s%s?%s', res.status, base, url, JSON.stringify(params));
      callback(err, res);
      spinner.remove();
    });
};

/**
 * Expose `post`
 */

module.exports.post = function(url, data, callback) {
  var spinner = spin();
  superagent
    .post(base + url)
    .send(data)
    .end(function(err, res) {
      debug('%s POST %s%s > %s', res.status, base, url, JSON.stringify(data));
      callback(err, res);
      spinner.remove();
    });
};

/**
 * Expose `del`
 */

module.exports.del = function(url, callback) {
  var spinner = spin();
  superagent
    .del(base + url)
    .end(function(err, res) {
      debug('%s DELETE %s%s', res.status, base, url);
      callback(err, res);
      spinner.remove();
    });
};

});
require.register("change-password-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':change-password-page');
var page = require('page');
var request = require('request');
var template = require('./template.html');
var create = require('view');

/**
 * Create view
 */

var View = create(template);

/**
 * On button click
 */

View.prototype.changePassword = function(e) {
  e.preventDefault();
  var password = this.find('#password').value;
  var repeat = this.find('#repeat-password').value;
  if (password !== repeat) return window.alert('Passwords do not match.');

  var key = this.model.key;
  request.post('/users/change-password', {
    change_password_key: key,
    password: password
  }, function(err, res) {
    if (res.ok) {
      alerts.push({
        type: 'success',
        text: 'Login using your new password.'
      });
      page('/manager/login');
    } else {
      window.alert(err || res.text ||
        'Failed to change password. Use the link sent to your email address.'
      );
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View({
    key: ctx.params.key
  });

  next();
};

});
require.register("component-to-function/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

try {
  var expr = require('props');
} catch(e) {
  var expr = require('props-component');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val;
  for(var i = 0, prop; prop = props[i]; i++) {
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";
    str = str.replace(new RegExp(prop, 'g'), val);
  }

  return str;
}

});
require.register("juliangruber-isarray/index.js", function(exports, require, module){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

});
require.register("component-enumerable/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function')
  , isArray = require("isarray")
  , proto = {};

/**
 * Expose `Enumerable`.
 */

module.exports = Enumerable;

/**
 * Mixin to `obj`.
 *
 *    var Enumerable = require('enumerable');
 *    Enumerable(Something.prototype);
 *
 * @param {Object} obj
 * @return {Object} obj
 */

function mixin(obj){
  for (var key in proto) obj[key] = proto[key];
  obj.__iterate__ = obj.__iterate__ || defaultIterator;
  return obj;
}

/**
 * Initialize a new `Enumerable` with the given `obj`.
 *
 * @param {Object} obj
 * @api private
 */

function Enumerable(obj) {
  if (!(this instanceof Enumerable)) {
    if (isArray(obj)) return new Enumerable(obj);
    return mixin(obj);
  }
  this.obj = obj;
}

/*!
 * Default iterator utilizing `.length` and subscripts.
 */

function defaultIterator() {
  var self = this;
  return {
    length: function(){ return self.length },
    get: function(i){ return self[i] }
  }
}

/**
 * Return a string representation of this enumerable.
 *
 *    [Enumerable [1,2,3]]
 *
 * @return {String}
 * @api public
 */

Enumerable.prototype.inspect =
Enumerable.prototype.toString = function(){
  return '[Enumerable ' + JSON.stringify(this.obj) + ']';
};

/**
 * Iterate enumerable.
 *
 * @return {Object}
 * @api private
 */

Enumerable.prototype.__iterate__ = function(){
  var obj = this.obj;
  obj.__iterate__ = obj.__iterate__ || defaultIterator;
  return obj.__iterate__();
};

/**
 * Iterate each value and invoke `fn(val, i)`.
 *
 *    users.each(function(val, i){
 *
 *    })
 *
 * @param {Function} fn
 * @return {Object} self
 * @api public
 */

proto.forEach =
proto.each = function(fn){
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    fn(vals.get(i), i);
  }
  return this;
};

/**
 * Map each return value from `fn(val, i)`.
 *
 * Passing a callback function:
 *
 *    users.map(function(user){
 *      return user.name.first
 *    })
 *
 * Passing a property string:
 *
 *    users.map('name.first')
 *
 * @param {Function} fn
 * @return {Enumerable}
 * @api public
 */

proto.map = function(fn){
  fn = toFunction(fn);
  var vals = this.__iterate__();
  var len = vals.length();
  var arr = [];
  for (var i = 0; i < len; ++i) {
    arr.push(fn(vals.get(i), i));
  }
  return new Enumerable(arr);
};

/**
 * Select all values that return a truthy value of `fn(val, i)`.
 *
 *    users.select(function(user){
 *      return user.age > 20
 *    })
 *
 *  With a property:
 *
 *    items.select('complete')
 *
 * @param {Function|String} fn
 * @return {Enumerable}
 * @api public
 */

proto.filter =
proto.select = function(fn){
  fn = toFunction(fn);
  var val;
  var arr = [];
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (fn(val, i)) arr.push(val);
  }
  return new Enumerable(arr);
};

/**
 * Select all unique values.
 *
 *    nums.unique()
 *
 * @return {Enumerable}
 * @api public
 */

proto.unique = function(){
  var val;
  var arr = [];
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (~arr.indexOf(val)) continue;
    arr.push(val);
  }
  return new Enumerable(arr);
};

/**
 * Reject all values that return a truthy value of `fn(val, i)`.
 *
 * Rejecting using a callback:
 *
 *    users.reject(function(user){
 *      return user.age < 20
 *    })
 *
 * Rejecting with a property:
 *
 *    items.reject('complete')
 *
 * Rejecting values via `==`:
 *
 *    data.reject(null)
 *    users.reject(tobi)
 *
 * @param {Function|String|Mixed} fn
 * @return {Enumerable}
 * @api public
 */

proto.reject = function(fn){
  var val;
  var arr = [];
  var vals = this.__iterate__();
  var len = vals.length();

  if ('string' == typeof fn) fn = toFunction(fn);

  if (fn) {
    for (var i = 0; i < len; ++i) {
      val = vals.get(i);
      if (!fn(val, i)) arr.push(val);
    }
  } else {
    for (var i = 0; i < len; ++i) {
      val = vals.get(i);
      if (val != fn) arr.push(val);
    }
  }

  return new Enumerable(arr);
};

/**
 * Reject `null` and `undefined`.
 *
 *    [1, null, 5, undefined].compact()
 *    // => [1,5]
 *
 * @return {Enumerable}
 * @api public
 */


proto.compact = function(){
  return this.reject(null);
};

/**
 * Return the first value when `fn(val, i)` is truthy,
 * otherwise return `undefined`.
 *
 *    users.find(function(user){
 *      return user.role == 'admin'
 *    })
 *
 * With a property string:
 *
 *    users.find('age > 20')
 *
 * @param {Function|String} fn
 * @return {Mixed}
 * @api public
 */

proto.find = function(fn){
  fn = toFunction(fn);
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (fn(val, i)) return val;
  }
};

/**
 * Return the last value when `fn(val, i)` is truthy,
 * otherwise return `undefined`.
 *
 *    users.findLast(function(user){
 *      return user.role == 'admin'
 *    })
 *
 * @param {Function} fn
 * @return {Mixed}
 * @api public
 */

proto.findLast = function(fn){
  fn = toFunction(fn);
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = len - 1; i > -1; --i) {
    val = vals.get(i);
    if (fn(val, i)) return val;
  }
};

/**
 * Assert that all invocations of `fn(val, i)` are truthy.
 *
 * For example ensuring that all pets are ferrets:
 *
 *    pets.all(function(pet){
 *      return pet.species == 'ferret'
 *    })
 *
 *    users.all('admin')
 *
 * @param {Function|String} fn
 * @return {Boolean}
 * @api public
 */

proto.all =
proto.every = function(fn){
  fn = toFunction(fn);
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (!fn(val, i)) return false;
  }
  return true;
};

/**
 * Assert that none of the invocations of `fn(val, i)` are truthy.
 *
 * For example ensuring that no pets are admins:
 *
 *    pets.none(function(p){ return p.admin })
 *    pets.none('admin')
 *
 * @param {Function|String} fn
 * @return {Boolean}
 * @api public
 */

proto.none = function(fn){
  fn = toFunction(fn);
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (fn(val, i)) return false;
  }
  return true;
};

/**
 * Assert that at least one invocation of `fn(val, i)` is truthy.
 *
 * For example checking to see if any pets are ferrets:
 *
 *    pets.any(function(pet){
 *      return pet.species == 'ferret'
 *    })
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api public
 */

proto.any = function(fn){
  fn = toFunction(fn);
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (fn(val, i)) return true;
  }
  return false;
};

/**
 * Count the number of times `fn(val, i)` returns true.
 *
 *    var n = pets.count(function(pet){
 *      return pet.species == 'ferret'
 *    })
 *
 * @param {Function} fn
 * @return {Number}
 * @api public
 */

proto.count = function(fn){
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  var n = 0;
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (fn(val, i)) ++n;
  }
  return n;
};

/**
 * Determine the indexof `obj` or return `-1`.
 *
 * @param {Mixed} obj
 * @return {Number}
 * @api public
 */

proto.indexOf = function(obj){
  var val;
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    val = vals.get(i);
    if (val === obj) return i;
  }
  return -1;
};

/**
 * Check if `obj` is present in this enumerable.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api public
 */

proto.has = function(obj){
  return !! ~this.indexOf(obj);
};

/**
 * Reduce with `fn(accumulator, val, i)` using
 * optional `init` value defaulting to the first
 * enumerable value.
 *
 * @param {Function} fn
 * @param {Mixed} [val]
 * @return {Mixed}
 * @api public
 */

proto.reduce = function(fn, init){
  var val;
  var i = 0;
  var vals = this.__iterate__();
  var len = vals.length();

  val = null == init
    ? vals.get(i++)
    : init;

  for (; i < len; ++i) {
    val = fn(val, vals.get(i), i);
  }

  return val;
};

/**
 * Determine the max value.
 *
 * With a callback function:
 *
 *    pets.max(function(pet){
 *      return pet.age
 *    })
 *
 * With property strings:
 *
 *    pets.max('age')
 *
 * With immediate values:
 *
 *    nums.max()
 *
 * @param {Function|String} fn
 * @return {Number}
 * @api public
 */

proto.max = function(fn){
  var val;
  var n = 0;
  var max = -Infinity;
  var vals = this.__iterate__();
  var len = vals.length();

  if (fn) {
    fn = toFunction(fn);
    for (var i = 0; i < len; ++i) {
      n = fn(vals.get(i), i);
      max = n > max ? n : max;
    }
  } else {
    for (var i = 0; i < len; ++i) {
      n = vals.get(i);
      max = n > max ? n : max;
    }
  }

  return max;
};

/**
 * Determine the min value.
 *
 * With a callback function:
 *
 *    pets.min(function(pet){
 *      return pet.age
 *    })
 *
 * With property strings:
 *
 *    pets.min('age')
 *
 * With immediate values:
 *
 *    nums.min()
 *
 * @param {Function|String} fn
 * @return {Number}
 * @api public
 */

proto.min = function(fn){
  var val;
  var n = 0;
  var min = Infinity;
  var vals = this.__iterate__();
  var len = vals.length();

  if (fn) {
    fn = toFunction(fn);
    for (var i = 0; i < len; ++i) {
      n = fn(vals.get(i), i);
      min = n < min ? n : min;
    }
  } else {
    for (var i = 0; i < len; ++i) {
      n = vals.get(i);
      min = n < min ? n : min;
    }
  }

  return min;
};

/**
 * Determine the sum.
 *
 * With a callback function:
 *
 *    pets.sum(function(pet){
 *      return pet.age
 *    })
 *
 * With property strings:
 *
 *    pets.sum('age')
 *
 * With immediate values:
 *
 *    nums.sum()
 *
 * @param {Function|String} fn
 * @return {Number}
 * @api public
 */

proto.sum = function(fn){
  var ret;
  var n = 0;
  var vals = this.__iterate__();
  var len = vals.length();

  if (fn) {
    fn = toFunction(fn);
    for (var i = 0; i < len; ++i) {
      n += fn(vals.get(i), i);
    }
  } else {
    for (var i = 0; i < len; ++i) {
      n += vals.get(i);
    }
  }

  return n;
};

/**
 * Determine the average value.
 *
 * With a callback function:
 *
 *    pets.avg(function(pet){
 *      return pet.age
 *    })
 *
 * With property strings:
 *
 *    pets.avg('age')
 *
 * With immediate values:
 *
 *    nums.avg()
 *
 * @param {Function|String} fn
 * @return {Number}
 * @api public
 */

proto.avg =
proto.mean = function(fn){
  var ret;
  var n = 0;
  var vals = this.__iterate__();
  var len = vals.length();

  if (fn) {
    fn = toFunction(fn);
    for (var i = 0; i < len; ++i) {
      n += fn(vals.get(i), i);
    }
  } else {
    for (var i = 0; i < len; ++i) {
      n += vals.get(i);
    }
  }

  return n / len;
};

/**
 * Return the first value, or first `n` values.
 *
 * @param {Number|Function} [n]
 * @return {Array|Mixed}
 * @api public
 */

proto.first = function(n){
  if ('function' == typeof n) return this.find(n);
  var vals = this.__iterate__();

  if (n) {
    var len = Math.min(n, vals.length());
    var arr = new Array(len);
    for (var i = 0; i < len; ++i) {
      arr[i] = vals.get(i);
    }
    return arr;
  }

  return vals.get(0);
};

/**
 * Return the last value, or last `n` values.
 *
 * @param {Number|Function} [n]
 * @return {Array|Mixed}
 * @api public
 */

proto.last = function(n){
  if ('function' == typeof n) return this.findLast(n);
  var vals = this.__iterate__();
  var len = vals.length();

  if (n) {
    var i = Math.max(0, len - n);
    var arr = [];
    for (; i < len; ++i) {
      arr.push(vals.get(i));
    }
    return arr;
  }

  return vals.get(len - 1);
};

/**
 * Return values in groups of `n`.
 *
 * @param {Number} n
 * @return {Enumerable}
 * @api public
 */

proto.inGroupsOf = function(n){
  var arr = [];
  var group = [];
  var vals = this.__iterate__();
  var len = vals.length();

  for (var i = 0; i < len; ++i) {
    group.push(vals.get(i));
    if ((i + 1) % n == 0) {
      arr.push(group);
      group = [];
    }
  }

  if (group.length) arr.push(group);

  return new Enumerable(arr);
};

/**
 * Return the value at the given index.
 *
 * @param {Number} i
 * @return {Mixed}
 * @api public
 */

proto.at = function(i){
  return this.__iterate__().get(i);
};

/**
 * Return a regular `Array`.
 *
 * @return {Array}
 * @api public
 */

proto.toJSON =
proto.array = function(){
  var arr = [];
  var vals = this.__iterate__();
  var len = vals.length();
  for (var i = 0; i < len; ++i) {
    arr.push(vals.get(i));
  }
  return arr;
};

/**
 * Return the enumerable value.
 *
 * @return {Mixed}
 * @api public
 */

proto.value = function(){
  return this.obj;
};

/**
 * Mixin enumerable.
 */

mixin(Enumerable.prototype);

});
require.register("component-collection/index.js", function(exports, require, module){

try {
  var Enumerable = require('enumerable');
} catch (e) {
  var Enumerable = require('enumerable-component');
}

/**
 * Expose `Collection`.
 */

module.exports = Collection;

/**
 * Initialize a new collection with the given `models`.
 *
 * @param {Array} models
 * @api public
 */

function Collection(models) {
  this.models = models || [];
}

/**
 * Mixin enumerable.
 */

Enumerable(Collection.prototype);

/**
 * Iterator implementation.
 */

Collection.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.length() },
    get: function(i){ return self.models[i] }
  }
};

/**
 * Return the collection length.
 *
 * @return {Number}
 * @api public
 */

Collection.prototype.length = function(){
  return this.models.length;
};

/**
 * Add `model` to the collection and return the index.
 *
 * @param {Object} model
 * @return {Number}
 * @api public
 */

Collection.prototype.push = function(model){
  return this.models.push(model);
};

});
require.register("component-model/lib/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

try {
  var Emitter = require('emitter');
} catch (e) {
  var Emitter = require('emitter-component');
}

var proto = require('./proto');
var statics = require('./static');

/**
 * Expose `createModel`.
 */

module.exports = createModel;

/**
 * Create a new model constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function createModel(name) {
  if ('string' != typeof name) throw new TypeError('model name required');

  /**
   * Initialize a new model with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function model(attrs) {
    if (!(this instanceof model)) return new model(attrs);
    attrs = attrs || {};
    this._callbacks = {};
    this.attrs = attrs;
    this.dirty = attrs;
    this.model.emit('construct', this, attrs);
  }

  // mixin emitter

  Emitter(model);

  // statics

  model.modelName = name;
  model._base = '/' + name.toLowerCase() + 's';
  model.attrs = {};
  model.validators = [];
  model._headers = {};
  for (var key in statics) model[key] = statics[key];

  // prototype

  model.prototype = {};
  model.prototype.model = model;
  for (var key in proto) model.prototype[key] = proto[key];

  return model;
}


});
require.register("component-model/lib/static.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Collection = require('collection');
var request = require('superagent');
var noop = function(){};

/**
 * Expose request for configuration
 */

exports.request = request;

/**
 * Construct a url to the given `path`.
 *
 * Example:
 *
 *    User.url('add')
 *    // => "/users/add"
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.url = function(path){
  var url = this._base;
  if (0 == arguments.length) return url;
  return url + '/' + path;
};

/**
 * Set base path for urls.
 * Note this is defaulted to '/' + modelName.toLowerCase() + 's'
 *
 * Example:
 *
 *   User.route('/api/u')
 *
 * @param {String} path
 * @return {Function} self
 * @api public
 */

exports.route = function(path){
  this._base = path;
  return this;
}

/**
 * Add custom http headers to all requests.
 *
 * Example:
 *
 *   User.headers({
 *    'X-CSRF-Token': 'some token',
 *    'X-API-Token': 'api token
 *   });
 *
 * @param {String|Object} header(s)
 * @param {String} value
 * @return {Function} self
 * @api public
 */

exports.headers = function(headers){
  for(var i in headers){
    this._headers[i] = headers[i];
  }
  return this;
};

/**
 * Add validation `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.validate = function(fn){
  this.validators.push(fn);
  return this;
};

/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(fn){
  fn(this);
  return this;
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

exports.attr = function(name, options){
  this.attrs[name] = options || {};

  // implied pk
  if ('_id' == name || 'id' == name) {
    this.attrs[name].primaryKey = true;
    this.primaryKey = name;
  }

  // getter / setter method
  this.prototype[name] = function(val){
    if (0 == arguments.length) return this.attrs[name];
    var prev = this.attrs[name];
    this.dirty[name] = val;
    this.attrs[name] = val;
    this.model.emit('change', this, name, val, prev);
    this.model.emit('change ' + name, this, val, prev);
    this.emit('change', name, val, prev);
    this.emit('change ' + name, val, prev);
    return this;
  };

  return this;
};

/**
 * Remove all and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

exports.destroyAll = function(fn){
  fn = fn || noop;
  var self = this;
  var url = this.url('');
  this.request
    .del(url)
    .set(this._headers)
    .end(function(res){
      if (res.error) return fn(error(res), null, res);
      fn(null, [], res);
    });
};

/**
 * Get all and invoke `fn(err, array)`.
 *
 * @param {Function} fn
 * @api public
 */

exports.all = function(fn){
  var self = this;
  var url = this.url('');
  this.request
    .get(url)
    .set(this._headers)
    .end(function(res){
      if (res.error) return fn(error(res), null, res);
      var col = new Collection;
      for (var i = 0, len = res.body.length; i < len; ++i) {
        col.push(new self(res.body[i]));
      }
      fn(null, col, res);
    });
};

/**
 * Get `id` and invoke `fn(err, model)`.
 *
 * @param {Mixed} id
 * @param {Function} fn
 * @api public
 */

exports.get = function(id, fn){
  var self = this;
  var url = this.url(id);
  this.request
    .get(url)
    .set(this._headers)
    .end(function(res){
      if (res.error) return fn(error(res), null, res);
      var model = new self(res.body);
      fn(null, model, res);
    });
};

/**
 * Response error helper.
 *
 * @param {Response} er
 * @return {Error}
 * @api private
 */

function error(res) {
  return new Error('got ' + res.status + ' response');
}

});
require.register("component-model/lib/proto.js", function(exports, require, module){

/**
 * Module dependencies.
 */

try {
  var Emitter = require('emitter');
  var each = require('each');
} catch (e) {
  var Emitter = require('emitter-component');
  var each = require('each-component');
}

var request = require('superagent');
var noop = function(){};

/**
 * Mixin emitter.
 */

Emitter(exports);

/**
 * Expose request for configuration
 */
exports.request = request;

/**
 * Register an error `msg` on `attr`.
 *
 * @param {String} attr
 * @param {String} msg
 * @return {Object} self
 * @api public
 */

exports.error = function(attr, msg){
  this.errors.push({
    attr: attr,
    message: msg
  });
  return this;
};

/**
 * Check if this model is new.
 *
 * @return {Boolean}
 * @api public
 */

exports.isNew = function(){
  var key = this.model.primaryKey;
  return ! this.has(key);
};

/**
 * Get / set the primary key.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.primary = function(val){
  var key = this.model.primaryKey;
  if (0 == arguments.length) return this[key]();
  return this[key](val);
};

/**
 * Validate the model and return a boolean.
 *
 * Example:
 *
 *    user.isValid()
 *    // => false
 *
 *    user.errors
 *    // => [{ attr: ..., message: ... }]
 *
 * @return {Boolean}
 * @api public
 */

exports.isValid = function(){
  this.validate();
  return 0 == this.errors.length;
};

/**
 * Return `false` or an object
 * containing the "dirty" attributes.
 *
 * Optionally check for a specific `attr`.
 *
 * @param {String} [attr]
 * @return {Object|Boolean}
 * @api public
 */

exports.changed = function(attr){
  var dirty = this.dirty;
  if (Object.keys(dirty).length) {
    if (attr) return !! dirty[attr];
    return dirty;
  }
  return false;
};

/**
 * Perform validations.
 *
 * @api private
 */

exports.validate = function(){
  var self = this;
  var fns = this.model.validators;
  this.errors = [];
  each(fns, function(fn){ fn(self) });
};

/**
 * Destroy the model and mark it as `.destroyed`
 * and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `destroying` before deletion
 *  - `destroy` on deletion
 *
 * @param {Function} [fn]
 * @api public
 */

exports.destroy = function(fn){
  fn = fn || noop;
  if (this.isNew()) return fn(new Error('not saved'));
  var self = this;
  var url = this.url();
  this.model.emit('destroying', this);
  this.emit('destroying');
  this.request
    .del(url)
    .set(this.model._headers)
    .end(function(res){
      if (res.error) return fn(error(res), res);
      self.destroyed = true;
      self.model.emit('destroy', self, res);
      self.emit('destroy');
      fn(null, res);
    });
};

/**
 * Save and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `saving` pre-update or save, after validation
 *  - `save` on updates and saves
 *
 * @param {Function} [fn]
 * @api public
 */

exports.save = function(fn){
  if (!this.isNew()) return this.update(fn);
  var self = this;
  var url = this.model.url();
  var key = this.model.primaryKey;
  fn = fn || noop;
  if (!this.isValid()) return fn(new Error('validation failed'));
  this.model.emit('saving', this);
  this.emit('saving');
  this.request
    .post(url)
    .set(this.model._headers)
    .send(self)
    .end(function(res){
      if (res.error) return fn(error(res), res);
      if (res.body) self.primary(res.body[key]);
      self.dirty = {};
      self.model.emit('save', self, res);
      self.emit('save');
      fn(null, res);
    });
};

/**
 * Update and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api private
 */

exports.update = function(fn){
  var self = this;
  var url = this.url();
  fn = fn || noop;
  if (!this.isValid()) return fn(new Error('validation failed'));
  this.model.emit('saving', this);
  this.emit('saving');
  this.request
    .put(url)
    .set(this.model._headers)
    .send(self)
    .end(function(res){
      if (res.error) return fn(error(res), res);
      self.dirty = {};
      self.model.emit('save', self, res);
      self.emit('save');
      fn(null, res);
    });
};

/**
 * Return a url for `path` relative to this model.
 *
 * Example:
 *
 *    var user = new User({ id: 5 });
 *    user.url('edit');
 *    // => "/users/5/edit"
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.url = function(path){
  var model = this.model;
  var url = model._base;
  var id = this.primary();
  if (0 == arguments.length) return url + '/' + id;
  return url + '/' + id + '/' + path;
};

/**
 * Set multiple `attrs`.
 *
 * @param {Object} attrs
 * @return {Object} self
 * @api public
 */

exports.set = function(attrs){
  for (var key in attrs) {
    this[key](attrs[key]);
  }
  return this;
};

/**
 * Get `attr` value.
 *
 * @param {String} attr
 * @return {Mixed}
 * @api public
 */

exports.get = function(attr){
  return this.attrs[attr];
};

/**
 * Check if `attr` is present (not `null` or `undefined`).
 *
 * @param {String} attr
 * @return {Boolean}
 * @api public
 */

exports.has = function(attr){
  return null != this.attrs[attr];
};

/**
 * Return the JSON representation of the model.
 *
 * @return {Object}
 * @api public
 */

exports.toJSON = function(){
  return this.attrs;
};

/**
 * Response error helper.
 *
 * @param {Response} er
 * @return {Error}
 * @api private
 */

function error(res) {
  return new Error('got ' + res.status + ' response');
}

});
require.register("component-clone/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

try {
  var type = require('type');
} catch (e) {
  var type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

});
require.register("manuelstofer-each/index.js", function(exports, require, module){
"use strict";

var nativeForEach = [].forEach;

// Underscore's each function
module.exports = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
};

});
require.register("manuelstofer-is/index.js", function(exports, require, module){
"use strict";
var each = require('each'),
    toString = Object.prototype.toString,
    types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'];

each(types, function (type) {
    module.exports[type.toLowerCase()] = function (obj) {
        return toString.call(obj) === '[object ' + type + ']';
    };
});

if (Array.isArray) {
    module.exports.array = Array.isArray;
}

module.exports.object = function (obj) {
    return obj === Object(obj);
};


});
require.register("segmentio-model-defaults/index.js", function(exports, require, module){

try {
  var clone = require('clone');
  var each = require('each');
  var type = require('type');
} catch (e) {
  var clone = require('clone-component');
  var each = require('each-component');
  var type = require('component-type');
}

var is = require('is');

/**
 * Plugin.
 *
 * @param {Function|Object} values  The default values dictionary or the Model.
 */

module.exports = function (values) {
  if ('object' === type(values)) {
    return function (Model) {
      bind(Model, values);
    };
  } else {
    return bind(values);
  }
};


/**
 * Bind to the model's construct event.
 *
 * @param {Function} Model  The model constructor.
 */

function bind (Model, defaults) {
  defaults || (defaults = {});
  Model.on('construct', function (model, attrs) {
    each(Model.attrs, function (key, options) {
      var value = undefined != options.default
        ? options.default
        : defaults[key];

      if (value !== undefined) apply(model, key, value);
    });
  });
}


/**
 * Default a `model` with a `value` for a `key` if it doesn't exist. Use a clone
 * of the value if it is not passed from a function, so that it's
 * easy to declare objects and arrays without worrying about copying by reference.
 *
 * @param {Model}          model  The model.
 * @param {String}         key    The key to back by a default.
 * @param {Mixed|Function} value  The default value to use.
 */

function apply (model, key, value) {
  if(model[key]() !== undefined) return;
  value = is.function(value) ? value.call(model) : clone(value);
  model[key](value);
}

});
require.register("component-bind/index.js", function(exports, require, module){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("segmentio-model-memoize/index.js", function(exports, require, module){
var each = require('each')
  , type = require('type')
  , bind = require('bind');


/**
 * Plugin.
 *
 * @param {Function|Object} models  The models to warm the cache with or the
 *                                  Model constructor for the plugin.
 */

module.exports = function (models) {
  // just the plugin
  if ('function' === type(models)) return new Memoizer(models);

  // warming cache with models
  return function (Model) {
    new Memoizer(Model, models);
  };
};


/**
 * Initialize a new `Memoizer`.
 *
 * @param {Model} Model   The Model constructor to memoize.
 * @param {Array} models  Optional array of models to warm the cache with.
 */

function Memoizer (Model, models) {
  this.Model = Model;
  this._get = bind(Model, Model.get);
  Model.get = bind(this, this.get);

  Model.on('construct', function (model) {
    cache[model.primary()] = model;
  });

  var cache = this.cache = {};
  if (models) each(models, function (attrs) {
    var model = new Model(attrs);
    cache[model.primary()] = model;
  });
}


/**
 * Check the cache before getting a model from the server.
 *
 * @param {String}   id        The primary key for the model.
 * @param {Function} callback  Called with `err, model`.
 */

Memoizer.prototype.get = function (id, callback) {
  var cache = this.cache;
  if (cache[id]) return callback(null, cache[id]);

  this._get(id, function (err, model) {
    if (err || !model) return callback(err);
    cache[model.primary()] = model;
    callback(null, model);
  });
};

});
require.register("trevorgerhardt-model-query/index.js", function(exports, require, module){

/**
 * Dependencies
 */

var Collection = require('collection');

/**
 *  Plugin.
 */

module.exports = function(Model) {
  /**
   * Create `get` request
   */

  function get() {
    var req = Model.request
      .get(Model.url(''))
      .set(Model._headers);

    var end = req.end;
    req.end = function(fn) {
      end.call(req, function(err, res) {
        if (err || !res.ok) {
          fn(err || new Error(res.text), null, res);
        } else {
          var col = new Collection();
          for (var i = 0, len = res.body.length; i < len; ++i) {
            col.push(new Model(res.body[i]));
          }
          fn(null, col, res);
        }
      });
    };

    var query = req.query;
    req.query = function(params, fn) {
      query.call(req, params);
      if (fn) return req.end(fn);
      return req;
    };

    req.limit = function(limit, fn) {
      return req.query({ limit: limit }, fn);
    };

    req.skip = function(skip, fn) {
      return req.query({ skip: skip }, fn);
    };

    return req;
  }

  /**
   *
   */

  Model.req = function(fn) {
    if (fn) return get().end(fn);
    else return get();
  };

  /**
   * Take a `query` and invoke `fn(err, collection, response)`
   *
   * @param {Object} query
   * @param {Function} callback
   */

  Model.query = function(query, fn) {
    return get().query(query, fn);
  };

  /**
   * Limi
   */

  Model.limit = function(limit, fn) {
    return get().limit(limit, fn);
  };

  /**
   * Skip
   */

  Model.skip = function(skip, fn) {
    return get().skip(skip, fn);
  };
};
});
require.register("map/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':map');
var page = require('page');

/**
 * Leaflet
 */

// var L = window.L;

/**
 * Expose `map`
 */

module.exports = function(el, opts) {
  opts = opts || {};
  opts.tileLayer = opts.tileLayer || {
    detectRetina: true
  };

  // create a map in the el with given options
  return new Map(L.mapbox.map(el, config.mapbox_map_id(), opts));
};

/**
 * Expose `createMarker`
 */

module.exports.createMarker = function(opts) {
  debug('creating marker %s', opts);

  var marker = L.marker(new L.LatLng(opts.coordinate[1], opts.coordinate[0]), {
    icon: L.mapbox.marker.icon({
      'marker-size': opts.size || 'medium',
      'marker-color': opts.color || '#ccc',
      'marker-symbol': opts.icon || ''
    }),
    title: opts.title || ''
  });
  if (opts.url) {
    marker.on('click', function() {
      page(opts.url);
    });
  }
  return marker;
};

/**
 * Map
 */

function Map(map) {
  this.map = map;
  this.featureLayer = L.mapbox.featureLayer().addTo(map);
}

/**
 * Add Marker
 */

Map.prototype.addMarker = function(marker) {
  this.featureLayer.addLayer(marker);
};

/**
 * Add Layer
 */

Map.prototype.addLayer = function(layer) {
  this.map.addLayer(layer);
};

/**
 * Fit bounds
 */

Map.prototype.fitLayer = function(layer) {
  debug('fitting layer %s', layer);
  var map = this.map;
  map.whenReady(function() {
    debug('map ready');
    setTimeout(function() {
      var bounds = layer.getBounds();
      debug('fitting to bounds %s', bounds);
      map.fitBounds(bounds);
    }, 200);
  });
};

/**
 * Fit to multiple layers
 */

Map.prototype.fitLayers = function(layers) {
  debug('fitting to %s layers', layers.length);
  var map = this.map;
  map.whenReady(function() {
    debug('map ready');
    setTimeout(function() {
      var bounds = layers[0].getBounds();
      for (var i = 1; i < layers.length; i++) {
        bounds.extend(layers[i].getBounds());
      }
      map.fitBounds(bounds);
    }, 200);
  });
};

/**
 * Featureify
 */

function featureify(opts) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: opts.coordinate
    },
    properties: {
      title: opts.title || '',
      description: opts.description || '',
      'marker-size': opts.size || 'medium',
      'marker-color': opts.color || '#ccc',
      'marker-symbol': opts.icon || ''
    }
  };
}

});
require.register("commuter/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':commuter');
var defaults = require('model-defaults');
var map = require('map');
var model = require('model');
var request = require('request');

/**
 * Expose `Commuter`
 */

var Commuter = module.exports = model('Commuter')
  .use(defaults({
    _user: {},
    name: '',
    coordinate: {},
    link: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    labels: []
  }))
  .use(require('model-query'))
  .use(require('model-memoize'))
  .route(config.api_url() + '/commuters')
  .attr('_id')
  .attr('_organization')
  .attr('_user')
  .attr('name')
  .attr('coordinate')
  .attr('address')
  .attr('city')
  .attr('state')
  .attr('zip')
  .attr('link')
  .attr('labels')
  .attr('created', {
    type: 'date'
  })
  .attr('updated', {
    type: 'date'
  });

/**
 * Load middleware
 */

Commuter.load = function(ctx, next) {
  if (ctx.params.commuter === 'new') return next();

  Commuter.get(ctx.params.commuter, function(err, commuter) {
    if (err) {
      next(err);
    } else {
      ctx.commuter = commuter;
      next();
    }
  });
};

/**
 * Load via link middleware
 */

Commuter.loadLink = function(ctx, next) {
  request.get('/commuters/link/' + ctx.params.link, function(err, res) {
    if (err || !res.ok) {
      next(err || new Error(res.text));
    } else {
      ctx.commuter = new Commuter(res.body);
      next();
    }
  });
};

/**
 * Load all commuters for an org middleware
 */

Commuter.loadOrg = function(ctx, next) {
  if (ctx.params.organization === 'new') return next();

  Commuter.query({
    _organization: ctx.params.organization
  }, function(err, commuters, res) {
    if (err || !res.ok) {
      debug(err || res.err || res.error);
      next(err || new Error(res.text));
    } else {
      ctx.commuters = commuters;
      next();
    }
  });
};

/**
 * Address
 */

Commuter.prototype.location = function() {
  return this.city() + ', ' + this.state() + ' ' + this.zip();
};

/**
 * Return map marker opts
 */

Commuter.prototype.mapMarker = function() {
  var c = this.coordinate();
  var coordinate = [obscure(c.lng), obscure(c.lat)];

  return map.createMarker({
    title: 'Approx. location of ' + this._user().email,
    description: '<a href=\"/manage/organizations/' + this._organization() +
      '/commuters/' +
      this._id() + '/show\">' + this.location() + '</a>',
    color: '#5cb85c',
    coordinate: coordinate,
    icon: 'building',
    size: 'small'
  });
};

/**
 * Obscure a ll by a bit
 */

function obscure(l) {
  return parseInt(l * 1000) / 1000;
}

});
require.register("component-value/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

});
require.register("trevorgerhardt-serialize/index.js", function(exports, require, module){

/**
 * Dependencies
 */

var value = require('value')
  , slice = Array.prototype.slice;

/**
 * Populate the form or serialize the form
 */

module.exports = function(el, data) {
  var els = elements(el);

  if (arguments.length === 1) {
    return serialize(els);
  } else {
    populate(els, data);
  }
};

/**
 * Serialize
 */

function serialize(els) {
  var data = {};
  for (var i = 0, el; el = els[i]; i++) {
    var name = el.getAttribute('name');
    if (!data[name]) {
      var val = value(el);
      
      switch (el.type) {
        case 'number':
          val = Number(val);
          break;
        case 'date':
        case 'month':
          val = new Date(val);
          break;
        case 'time':
          var hours = val.split(':')[0]
            , minutes = val.split(':')[1];

          val = new Date();
          val.setHours(hours);
          val.setMinutes(minutes);
          break;
        case 'submit':
        case 'button':
        case 'reset':
          continue; 
      }

      data[name] = val;
    }
  }
  return data;
}

/**
 * Populate
 */

function populate(els, data) {
  for (var i = 0, el; el = els[i]; i++) {
    var val = data[el.getAttribute('name')];
    if (val !== undefined) {

      switch (el.type) {
      case 'date':
      case 'month':
        if (val instanceof Date) {
          var month = add0(val.getMonth() + 1)
            , date = add0(val.getDate());

          val = val.getFullYear() + '-' + month;
          if (el.type === 'date') {
            val += '-' + date;
          }
        }
        break;
      case 'time':
        if (val instanceof Date) {
          var hours = add0(val.getHours())
            , minutes = add0(val.getMinutes());

          val = hours + ':' + minutes;
        }
        break;
      case 'submit':
      case 'button':
      case 'reset':
        continue; 
      }

      value(el, val);
    } 
  }
}

/**
 * Elements
 */

function elements(el) {
  var inputs = slice.call(el.getElementsByTagName('input'))
    , selects = slice.call(el.getElementsByTagName('select'))
    , textareas = slice.call(el.getElementsByTagName('textarea'));

  return inputs.concat(selects).concat(textareas);
}

/**
 * If a number is < 10, add a zero before turning it into a string
 */

function add0(number) {
  return (number > 9 ? number + '' : '0' + number);
}

});
require.register("segmentio-reactive-child/index.js", function(exports, require, module){
module.exports = function(reactive) {
  reactive.bind('reactive', function(el, attr){
    this.change(function(){
      var view = this.reactive.view;
      view.children || (view.children = {});
      var parent = el.parentNode;
      var child = this.value(attr);
      if(!child) return;
      parent.replaceChild(child.el, el);
      view.children[attr] = child;
    });
  });
};
});
require.register("segmentio-reactive-disabled/index.js", function(exports, require, module){
module.exports = function(reactive) {
  reactive.bind('data-disabled', function(el, attr){
    this.change(function(){
      if(this.value(attr)) {
        el.setAttribute('disabled', true);
      }
      else {
        el.removeAttribute('disabled');
      }
    });
  });
};
});
require.register("view/dropdown.js", function(exports, require, module){
/**
 * Dependencies
 */

var classes = require('classes');
var evnt = require('event');

/**
 * Expose `plugin`
 */

module.exports = function(reactive) {
  reactive.bind('dropdown', function(el, selector) {
    var parent = el.parentNode;
    var list = classes(parent);
    var close = function(e) {
      if (!childOf(e.target, parent)) {
        list.remove('open');
        evnt.unbind(document, 'click', close);
      }
    };

    evnt.bind(el, 'click', function(e) {
      e.stopPropagation();

      if (list.has('open')) {
        list.remove('open');
        evnt.unbind(document, 'click', close);
      } else {
        list.add('open');
        evnt.bind(document, 'click', close);
      }
    });
  });
};

/**
 * Is a node a child of another?
 */

function childOf(c, p) {
  while ((c = c.parentNode) && c !== p);
  return !!c;
}

});
require.register("view/each.js", function(exports, require, module){
/**
 * `data-each="items"`
 */

module.exports = function(reactive) {
  reactive.bind('data-each', function(el, attr, model) {
    var container = this.el;
    this.change(function() {
      container.innerHTML = '';

      var items = this.value(attr);
      if (!items || items.forEach === undefined) return;

      var View = this.value(attr + '-view');
      if (!View) return;

      items.forEach(function(item) {
        var view = new View(item);
        container.appendChild(view.el);
      });
    });
  });
};

});
require.register("view/index.js", function(exports, require, module){
/**
 * Dendencies
 */

var reactive = require('reactive');
var view = require('view');

/**
 * Set up reactive plugins
 */

reactive.use(require('./dropdown'));
reactive.use(require('./each'));
reactive.use(require('reactive-child'));
reactive.use(require('reactive-disabled'));

/**
 * Expose `view`
 */

module.exports = view;

});
require.register("commuter-form/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var Alert = require('alert');
var alerts = require('alerts');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':commuter-form');
var page = require('page');
var serialize = require('serialize');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('render');

  if (ctx.commuter) {
    ctx.view = new View(ctx.commuter);
    ctx.view.organization = ctx.organization;
  } else {
    ctx.view = new View(new Commuter({
      _organization: ctx.params.organization
    }));
  }

  next();
};

/**
 * Action
 */

View.prototype.action = function() {
  if (this.model.isNew()) return 'Add';
  if (typeof this.model._organization() === 'string') return 'Edit';
  return 'Hello';
};

/**
 * Is Old?
 */

View.prototype.isEditing = function() {
  return !this.model.isNew();
};

/**
 * Email
 */

View.prototype.email = function() {
  return this.model._user().email || '';
};

/**
 * Back?
 */

View.prototype.back = function() {
  var m = this.model;
  var org = m._organization();
  return m.isNew() ? '/manager/organizations/' + org + '/show' :
    '/manager/organizations/' + org + '/commuters/' + m._id() + '/show';
};

/**
 * Labels
 */

View.prototype.labels = function() {
  return this.model.labels().length > 0 ? this.model.labels().join(', ') : '';
};

/**
 * Save!
 */

View.prototype.save = function(e) {
  debug('save');

  var data = serialize(this.el);
  data.labels = data.labels && data.labels.length > 0 ? data.labels.split(',') : [];
  data.labels = data.labels.map(function(label) {
    return label.trim();
  });
  data.zip = parseInt(data.zip);

  // set the email address
  this.model._user({
    email: data.email
  });
  delete data.email;

  // set the rest of the data
  this.model.set(data);

  var text = this.model.isNew() ? 'Added new commuter.' :
    'Saved changes to commuter.';

  var self = this;
  this.model.save(function(err) {
    if (err) {
      new Alert({
        type: 'danger',
        text: err
      });
    } else {
      alerts.push({
        type: 'success',
        text: text
      });
      page(self.back());
    }
  });
};

});
require.register("commuter-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var alerts = require('alerts');
var Commuter = require('commuter');
var config = require('config');
var debug = require('debug')(config.name() + ':commuter-page');
var map = require('map');
var page = require('page');
var request = require('request');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('render');
  if (ctx.params.commuter === 'new' || !ctx.commuter) return;

  ctx.view = new View(ctx.commuter, {
    organization: ctx.organization
  });
  ctx.view.on('rendered', function(v) {
    var m = window.map = map(v.find('.map'), {
      center: ctx.commuter.coordinate(),
      zoom: 13
    });

    m.addMarker(ctx.commuter.mapMarker());
    m.addMarker(ctx.organization.mapMarker());
    m.fitLayer(m.featureLayer);
  });

  next();
};

/**
 * Destroy
 */

View.prototype.destroy = function(e) {
  e.preventDefault();
  if (window.confirm('Delete commuter?')) {
    var url = '/manager/organizations/' + this.model._organization() + '/show';
    this.model.destroy(function(err) {
      if (err) {
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted commuter.'
        });
        page(url);
      }
    });
  }
};

/**
 * Send
 */

View.prototype.sendPlan = function(e) {
  e.preventDefault();
  if (window.confirm('Send personalized plan to commuter?')) {
    request.post('/commuters/' + this.model._id() + '/send-plan', {}, function(
      err, res) {
      if (err || !res.ok) {
        debug(err, res);
        window.alert('Failed to send plan.');
      } else {
        alerts.show({
          type: 'success',
          text: 'Emailed plan to commuter.'
        });
      }
    });
  }
};

/**
 * To Location
 */

View.prototype.toLocation = function() {
  return this.options.organization.location();
};

});
require.register("segmentio-value/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

});
require.register("forgot-password-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var debug = require('debug')('forgot-password-page');
var request = require('request');
var template = require('./template.html');
var value = require('value');
var create = require('view');

/**
 * Create view
 */

var View = create(template);

/**
 * Send password change request
 */

View.prototype.sendChangeRequest = function(e) {
  e.preventDefault();
  var email = value(this.find('#email'));
  var self = this;
  request.post('/users/change-password-request', {
    email: email
  }, function(err, res) {
    if (res.ok) {
      window.alert(
        'Check your inbox for instructions to change your password.');
    } else {
      window.alert(err || res.text ||
        'Failed to send change password request.');
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();

  next();
};

});
require.register("login-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':login-page');
var page = require('page');
var request = require('request');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * On button click
 */

View.prototype.login = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var password = this.find('#password').value;
  var self = this;

  request.post('/login', {
    email: email,
    password: password
  }, function(err, res) {
    if (res.ok) {
      alerts.push({
        type: 'success',
        text: 'Welcome back!'
      });
      page('/manager/organizations');
    } else {
      window.alert(err || res.text || 'Failed to login.');
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();

  next();
};

});
require.register("user/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':user');
var model = require('model');

/**
 * Expose `Manager`
 */

var User = module.exports = model('User')
  .route(config.api_url() + '/users')
  .use(require('model-query'))
  .attr('_id')
  .attr('email')
  .attr('type')
  .attr('created')
  .attr('modified');

});
require.register("managers-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':managers-page');
var page = require('page');
var request = require('request');
var session = require('session');
var User = require('user');
var view = require('view');

/**
 * Create View
 */

var View = view(require('./template.html'));
var ManagerView = view(require('./manager.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();
  User.query({
    $query: 'type:administrator OR type:manager'
  }, function(err, managers, res) {
    if (err || !res.ok) {
      window.alert(err || res.text || 'Failed to load managers.');
    } else {
      var tbody = ctx.view.find('tbody');
      managers.each(function(user) {
        if (user.email() === session.user().email()) return;
        var view = new ManagerView(user);
        tbody.appendChild(view.el);
      });
    }
    next();
  });
};

/**
 * Create
 */

View.prototype.create = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var user = new User({
    email: email,
    type: 'manager'
  });
  user.save(function(err) {
    if (err) {
      debug(err);
      window.alert('Failed to create manager.');
    } else {
      alerts.push({
        type: 'success',
        text: 'Created new manager.'
      });
      page('/manager/managers');
    }
  });
};

/**
 * Delete
 */

ManagerView.prototype.destroy = function(e) {
  e.preventDefault();
  if (window.confirm('Delete this manager?')) {
    this.model.destroy(function(err) {
      if (err) {
        debug(err);
        window.alert('Failed to delete manager.');
      } else {
        alerts.push({
          type: 'success',
          text: 'Created new manager.'
        });
        page('/manager/managers');
      }
    });
  }
};

/**
 * Reset password
 */

ManagerView.prototype.resetPassword = function(e) {
  if (window.confirm('Reset user\'s password?')) {
    request.post('/users/change-password-request', {
      email: this.model.email()
    }, function(err, res) {
      if (err || !res.ok) {
        debug(err, res);
        window.alert('Failed to send reset password request.');
      } else {
        alerts.show({
          type: 'success',
          text: 'Reset password request sent.'
        });
      }
    });
  }
};

/**
 * Make admin
 */

ManagerView.prototype.makeAdmin = function(e) {
  this.model.type('administrator');
  this.model.save(function(err) {
    if (err) {
      debug(err);
    } else {
      alerts.push({
        type: 'success',
        text: 'Manager now has administrator access.'
      });
      page('/manager/managers');
    }
  });
};

/**
 * Remove admin
 */

ManagerView.prototype.removeAdmin = function(e) {
  this.model.type('manager');
  this.model.save(function(err) {
    if (err) {
      debug(err);
    } else {
      alerts.push({
        type: 'success',
        text: 'Manager no longer has administrator access.'
      });
      page('/manager/managers');
    }
  });
};

/**
 * Is Admin?
 */

ManagerView.prototype.isAdmin = function() {
  return this.model.type() === 'administrator';
};
ManagerView.prototype.isNotAdmin = function() {
  return this.model.type() !== 'administrator';
};

});
require.register("organization/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':organization');
var defaults = require('model-defaults');
var map = require('map');
var model = require('model');

/**
 * Expose `Organization`
 */

var Organization = module.exports = model('Organization')
  .use(defaults({
    name: '',
    contact: '',
    email: '',
    coordinate: {},
    address: '',
    city: '',
    state: '',
    zip: '',
    labels: []
  }))
  .use(require('model-memoize'))
  .use(require('model-query'))
  .route(config.api_url() + '/organizations')
  .attr('_id')
  .attr('name')
  .attr('contact')
  .attr('email')
  .attr('coordinate')
  .attr('address')
  .attr('city')
  .attr('state')
  .attr('zip')
  .attr('labels')
  .attr('created', {
    type: 'date'
  })
  .attr('updated', {
    type: 'date'
  });

/**
 * Load middleware
 */

Organization.load = function(ctx, next) {
  if (ctx.params.organization === 'new') return next();

  Organization.get(ctx.params.organization, function(err, org) {
    if (err) {
      next(err);
    } else {
      ctx.organization = org;
      next();
    }
  });
};

/**
 * Location
 */

Organization.prototype.location = function() {
  return this.address() + ', ' + this.city() + ', ' + this.state() + ' ' + this
    .zip();
};

/**
 * Return map marker opts
 */

Organization.prototype.mapMarker = function() {
  var c = this.coordinate();
  return map.createMarker({
    title: '<a href="/manager/organizations/' + this._id() + '/show">' + this
      .name() +
      '</a>',
    description: this.location(),
    color: '#428bca',
    coordinate: [c.lng, c.lat],
    icon: 'commercial'
  });
};

});
require.register("organization-form/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':organization-form');
var Organization = require('organization');
var page = require('page');
var serialize = require('serialize');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('render');

  if (ctx.organization) {
    ctx.view = new View(ctx.organization);
  } else {
    ctx.view = new View(new Organization());
  }

  next();
};

/**
 * Action
 */

View.prototype.action = function() {
  return this.model.isNew() ? 'Create' : 'Edit';
};

/**
 * Back
 */

View.prototype.back = function() {
  return this.model.isNew() ? '/manager/organizations' :
    '/manager/organizations/' + this.model._id() + '/show';
};

/**
 * Labels
 */

View.prototype.labels = function() {
  return this.model.labels().length > 0 ? this.model.labels().join(', ') : '';
};

/**
 * Save!
 */

View.prototype.save = function(e) {
  debug('save');
  var data = serialize(this.el);
  data.labels = data.labels && data.labels.length > 0 ? data.labels.split(',') : [];
  data.labels = data.labels.map(function(label) {
    return label.trim();
  });
  data.zip = parseInt(data.zip);
  this.model.set(data);

  var text = this.model.isNew() ? 'Created new organization.' :
    'Saved changes to organization.';

  var self = this;
  this.model.save(function(err) {
    if (err) {
      alerts.show({
        type: 'danger',
        text: err
      });
    } else {
      alerts.push({
        type: 'success',
        text: text
      });
      page('/manager/organizations/' + self.model._id() + '/show');
    }
  });
};

});
require.register("component-file/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var file = require('./file')
  , reader = require('./reader');

/**
 * Expose `file()`.
 */

exports = module.exports = file;

/**
 * Expose `reader()`.
 */

exports.reader = reader;
});
require.register("component-file/file.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , Reader = require('./reader');

/**
 * Expose `file()`.
 */

module.exports = file;

/**
 * Initialize a new `File` wrapping `file`.
 *
 * @param {File} file
 * @return {File}
 * @api public
 */

function file(file) {
  return new File(file);
}

/**
 * Initialize a new `File` wrapper.
 *
 * @param {File} file
 * @api private
 */

function File(file) {
  Emitter.call(this);
  this.file = file;
  for (var key in file) this[key] = file[key];
}

/**
 * Inherits from `Emitter.prototype`.
 */

Emitter(File.prototype);

/**
 * Check if the mime type matches `type`.
 *
 * Examples:
 *
 *    file.is('image/jpeg')
 *    file.is('image/*')
 *
 * @param {String} type
 * @return {Boolean}
 * @api public
 */

File.prototype.is = function(type){
  var real = this.file.type;

  // identical
  if (type == real) return true;

  real = real.split('/');
  type = type.split('/');

  // type/*
  if (type[0] == real[0] && type[1] == '*') return true;

  // */subtype
  if (type[1] == real[1] && type[0] == '*') return true;

  return false;
};

/**
 * Convert to `type` and invoke `fn(err, result)`.
 *
 * @param {String} type
 * @param {Function} fn
 * @return {Reader}
 * @api private
 */

File.prototype.to = function(type, fn){
  if (!window.FileReader) return fn();
  var reader = Reader();
  reader.on('error', fn);
  reader.on('end', function(res){ fn(null, res) });
  reader.read(this.file, type);
  return reader;
};

/**
 * Convert to an `ArrayBuffer`.
 *
 * @param {Function} fn
 * @return {Reader}
 * @api public
 */

File.prototype.toArrayBuffer = function(fn){
  return this.to('ArrayBuffer', fn);
};

/**
 * Convert to text.
 *
 * @param {Function} fn
 * @return {Reader}
 * @api public
 */

File.prototype.toText = function(fn){
  // TODO: encoding
  return this.to('Text', fn);
};

/**
 * Convert to a data uri.
 *
 * @param {Function} fn
 * @return {Reader}
 * @api public
 */

File.prototype.toDataURL = function(fn){
  return this.to('DataURL', fn);
};

});
require.register("component-file/reader.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');

/**
 * Expose `reader()`.
 */

module.exports = reader;

/**
 * Initialize a new `Reader` from optional `reader`
 * or a new `FileReader` is created.
 *
 * @param {FileReader} reader
 * @return {Reader}
 * @api public
 */

function reader(reader) {
  return reader
    ? new Reader(reader)
    : new Reader(new FileReader);
}

/**
 * Initialize a new `Reader`, a wrapper
 * around a `FileReader`.
 *
 * Emits:
 *
 *   - `error` an error occurred
 *   - `progress` in progress (`e.percent` etc)
 *   - `end` read is complete
 *
 * @param {FileReader} reader
 * @api private
 */

function Reader(reader) {
  Emitter.call(this);
  this.reader = reader;
  reader.onerror = this.emit.bind(this, 'error');
  reader.onabort = this.emit.bind(this, 'error', new Error('abort'));
  reader.onprogress = this.onprogress.bind(this);
  reader.onload = this.onload.bind(this);
}

/**
 * Inherits from `Emitter.prototype`.
 */

Emitter(Reader.prototype);

/**
 * Onload handler.
 * 
 * @api private
 */

Reader.prototype.onload = function(e){
  this.emit('end', this.reader.result);
};

/**
 * Progress handler.
 * 
 * @api private
 */

Reader.prototype.onprogress = function(e){
  e.percent = e.loaded / e.total * 100 | 0;
  this.emit('progress', e);
};

/**
 * Abort.
 *
 * @api public
 */

Reader.prototype.abort = function(){
  this.reader.abort();
};

/**
 * Read `file` as `type`.
 *
 * @param {File} file
 * @param {String} type
 * @api private
 */

Reader.prototype.read = function(file, type){
  var method = 'readAs' + type;
  this.reader[method](file);
};


});
require.register("component-file-picker/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var event = require('event');

/**
 * Expose `FilePicker`
 */

module.exports = FilePicker;

/**
 * Input template
 */

var form = document.createElement('form');
form.innerHTML = '<input type="file" style="top: -1000px; position: absolute" aria-hidden="true">';
document.body.appendChild(form);
var input = form.childNodes[0];

/**
 * Already bound
 */

var bound = false;

/**
 * Opens a file picker dialog.
 *
 * @param {Object} options (optional)
 * @param {Function} fn callback function
 * @api public
 */

function FilePicker(opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  opts = opts || {};

  // multiple files support
  input.multiple = !!opts.multiple;

  // directory support
  input.webkitdirectory = input.mozdirectory = input.directory = !!opts.directory;

  // accepted file types support
  if (null == opts.accept) {
    delete input.accept;
  } else if (opts.accept.join) {
    // got an array
    input.accept = opts.accept.join(',');
  } else if (opts.accept) {
    // got a regular string
    input.accept = opts.accept;
  }

  // listen to change event (unbind old one if already listening)
  if (bound) event.unbind(input, 'change', bound);
  event.bind(input, 'change', onchange);
  bound = onchange;

  function onchange(e) {
    fn(input.files, e, input);
    event.unbind(input, 'change', onchange);
    bound = false;
  }

  // reset the form
  form.reset();

  // trigger input dialog
  input.click();
}

});
require.register("trevorgerhardt-csv-to-array/index.js", function(exports, require, module){

/**
 * Parse CSV
 *
 * @param {String} csv
 * @return {Array}
 */

module.exports = function csvToArray(csv) {
  var array = [];
  var rows = csv.split(/\r\n|\n/);
  var keys = rowToArray(rows.shift());

  for (var i = 0; i < rows.length; i++) {
    var obj = {};
    var values = rowToArray(rows[i]);
    for (var j = 0; j < keys.length; j++) {
      obj[keys[j]] = values.shift();
    }
    array.push(obj);
  }

  return array;
};

/**
 * Split a row and trim it
 *
 * @param {String} row
 * @return {Array}
 */

function rowToArray(row) {
  var array = row.split(',');
  for (var i = 0; i < array.length; i++) {
    array[i] = array[i].trim();
  }
  return array;
}

});
require.register("visionmedia-batch/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

try {
  var EventEmitter = require('events').EventEmitter;
} catch (err) {
  var Emitter = require('emitter');
}

/**
 * Noop.
 */

function noop(){}

/**
 * Expose `Batch`.
 */

module.exports = Batch;

/**
 * Create a new Batch.
 */

function Batch() {
  if (!(this instanceof Batch)) return new Batch;
  this.fns = [];
  this.concurrency(Infinity);
  this.throws(true);
  for (var i = 0, len = arguments.length; i < len; ++i) {
    this.push(arguments[i]);
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

if (EventEmitter) {
  Batch.prototype.__proto__ = EventEmitter.prototype;
} else {
  Emitter(Batch.prototype);
}

/**
 * Set concurrency to `n`.
 *
 * @param {Number} n
 * @return {Batch}
 * @api public
 */

Batch.prototype.concurrency = function(n){
  this.n = n;
  return this;
};

/**
 * Queue a function.
 *
 * @param {Function} fn
 * @return {Batch}
 * @api public
 */

Batch.prototype.push = function(fn){
  this.fns.push(fn);
  return this;
};

/**
 * Set wether Batch will or will not throw up.
 *
 * @param  {Boolean} throws
 * @return {Batch}
 * @api public
 */
Batch.prototype.throws = function(throws) {
  this.e = !!throws;
  return this;
};

/**
 * Execute all queued functions in parallel,
 * executing `cb(err, results)`.
 *
 * @param {Function} cb
 * @return {Batch}
 * @api public
 */

Batch.prototype.end = function(cb){
  var self = this
    , total = this.fns.length
    , pending = total
    , results = []
    , errors = []
    , cb = cb || noop
    , fns = this.fns
    , max = this.n
    , throws = this.e
    , index = 0
    , done;

  // empty
  if (!fns.length) return cb(null, results);

  // process
  function next() {
    var i = index++;
    var fn = fns[i];
    if (!fn) return;
    var start = new Date;

    try {
      fn(callback);
    } catch (err) {
      callback(err);
    }

    function callback(err, res){
      if (done) return;
      if (err && throws) return done = true, cb(err);
      var complete = total - pending + 1;
      var end = new Date;

      results[i] = res;
      errors[i] = err;

      self.emit('progress', {
        index: i,
        value: res,
        error: err,
        pending: pending,
        total: total,
        complete: complete,
        percent: complete / total * 100 | 0,
        start: start,
        end: end,
        duration: end - start
      });

      if (--pending) next();
      else if(!throws) cb(errors, results);
      else cb(null, results);
    }
  }

  // concurrency
  for (var i = 0; i < fns.length; i++) {
    if (i == max) break;
    next();
  }

  return this;
};

});
require.register("organization-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var alerts = require('alerts');
var Batch = require('batch');
var Commuter = require('commuter');
var config = require('config');
var csvToArray = require('csv-to-array');
var debug = require('debug')(config.name() + ':organization-page');
var each = require('each');
var file = require('file');
var filePicker = require('file-picker');
var page = require('page');
var map = require('map');
var Organization = require('organization');
var request = require('request');
var spin = require('spinner');
var view = require('view');

/**
 * Create `View`
 */

var Row = view(require('./row.html'));
var View = view(require('./template.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('render');

  ctx.organization.commuters = ctx.commuters;
  ctx.view = new View(ctx.organization);
  ctx.view.on('rendered', function() {
    var m = map(ctx.view.find('.map'), {
      center: ctx.organization.coordinate(),
      zoom: 13
    });
    m.addMarker(ctx.organization.mapMarker());

    var cluster = new L.MarkerClusterGroup();
    ctx.commuters.forEach(function(commuter) {
      cluster.addLayer(commuter.mapMarker());
    });

    m.addLayer(cluster);
    m.fitLayers([m.featureLayer, cluster]);
  });

  next();
};

/**
 * Commuter View
 */

View.prototype['commuters-view'] = function() {
  return Row;
};

/**
 * Commuters
 */

View.prototype.commuterCount = function() {
  return this.model.commuters.length();
};

/**
 * Destroy
 */

View.prototype.destroy = function(e) {
  if (window.confirm('Delete organization?')) {
    this.model.destroy(function(err) {
      if (err) {
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted organization.'
        });
        page('/manager/organizations');
      }
    });
  }
};

/**
 * Upload CSV
 */

View.prototype.uploadCSV = function(e) {
  var view = this;
  var spinner = spin();
  filePicker({
    accept: ['.csv']
  }, function(files) {
    var csv = file(files[0]);
    csv.toText(function(err, text) {
      var batch = new Batch();
      each(csvToArray(text), function(data) {
        if (!data.email || data.email.length < 5) {
          return alerts.show({
            type: 'danger',
            text: 'Each commuter must have an email address.'
          });
        }

        batch.push(function(done) {
          var commuter = new Commuter(data);
          commuter._user({
            email: data.email
          });
          commuter._organization(view.model._id());
          commuter.save(done);
        });
      });

      batch.end(function(err) {
        if (err) {
          window.alert('Error while uploading CSV. ' + err);
        } else {
          alerts.push({
            type: 'success',
            text: 'Upload succesful, commuters created.'
          });
        }
        spin.remove();
        page('/manager/organizations/' + view.model._id() + '/show');
      });
    });
  });
};

/**
 * Row labels
 */

Row.prototype.labels = function() {
  var l = this.model.labels();
  return l.map(function(label) {
    return '<span class="label label-default">' + label + '</span>';
  }).join(' ');
};

});
require.register("organizations-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var config = require('config');
var debug = require('debug')(config.name() + ':organizations-page');
var map = require('map');
var Organization = require('organization');
var Row = require('./row');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * Expose `render` middleware
 */

module.exports = function(ctx, next) {
  debug('render');

  Organization.all(function(err, orgs, res) {
    if (err || !res.ok) {
      window.alert(res.text || 'Failed to load organizations.');
    } else {
      ctx.view = new View({
        organizations: orgs,
        'organizations-view': function() {
          return Row;
        }
      });

      next();
    }
  });
};

});
require.register("organizations-page/row.js", function(exports, require, module){
/**
 * Dependencies
 */

var template = require('./row.html');
var view = require('view');

/**
 * Expose `Row`
 */

var Row = module.exports = view(template);

});
require.register("manager-router/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var Page404 = require('404-page');
var analytics = require('analytics');
var Commuter = require('commuter');
var commuterForm = require('commuter-form');
var config = require('config');
var debug = require('debug')(config.name() + ':manager-router');
var Organization = require('organization');
var organizationForm = require('organization-form');
var p = require('page');
var session = require('session');

/**
 * Show alerts
 */

p('*', require('alerts'));

/**
 * If the user is logged in, redirect to orgs, else redirect to login
 */

p('/', session.checkIfLoggedIn, redirect('/organizations'));

/**
 * Public links
 */

p('/login', require('login-page'));
p('/logout', session.logout);
p('/forgot-password', require('forgot-password-page'));
p('/change-password/:key', require('change-password-page'));

/**
 * Admin only
 */

p('/managers', session.checkIfLoggedIn, session.checkIfAdmin, require(
  'managers-page'));

/**
 * Organizations
 */

p('/organizations*', session.checkIfLoggedIn);
p('/organizations', require('organizations-page'));
p('/organizations/new', organizationForm);
p('/organizations/:organization/*', Organization.load);
p('/organizations/:organization/show', Commuter.loadOrg, require(
  'organization-page'));
p('/organizations/:organization/edit', organizationForm);

/**
 * Commuters
 */

p('/organizations/:organization/commuters/new', commuterForm);
p('/organizations/:organization/commuters/:commuter/*', Commuter.load);
p('/organizations/:organization/commuters/:commuter/show', require(
  'commuter-page'));
p('/organizations/:organization/commuters/:commuter/edit', commuterForm);

/**
 * Render all
 */

p('*', render);

/**
 * Cache `main` & `view`
 */

var $main = document.getElementById('main');
var view = null;

/**
 * Render
 */

function render(ctx, next) {
  debug('render %s %s', ctx.path, ctx.view);

  // remove old view
  if (view) {
    view.off();
    if (view.el && view.el.remove) view.el.remove();
  }

  // if no view has been created or ther was an error, create an error page
  if (!ctx.view || ctx.error) ctx.view = new Page404(ctx.error || {});

  view = ctx.view;

  $main.innerHTML = '';
  $main.appendChild(view.el);
  view.emit('rendered', view);

  // track the page view
  analytics.page(ctx.view.category, ctx.view.title, ctx.view.properties);
}

/**
 * Redirect
 */

function redirect(to) {
  return function(ctx) {
    p('/organizations');
  };
}

});
require.register("session/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var analytics = require('analytics');
var config = require('config');
var debug = require('debug')(config.name() + ':session');
var defaults = require('model-defaults');
var model = require('model');
var page = require('page');
var request = require('request');
var User = require('user');

/**
 * Session
 */

var Session = model('Session')
  .use(defaults({
    isAdmin: false,
    isLoggedIn: false,
    isManager: false
  }))
  .attr('user')
  .attr('isAdmin')
  .attr('isLoggedIn')
  .attr('isManager');

/**
 * Expose `session`
 */

var session = window.session = module.exports = new Session();

/**
 * Track user
 */

session.on('change user', function(user) {
  if (user) analytics.identify(user._id(), user.toJSON());
  else analytics.identify(null);
});

/**
 * Login
 */

module.exports.login = function(data, callback) {
  request.post('/login', data, function(err, res) {
    if (res.ok) {
      var user = new User(res.body);

      session.user(user);
      session.isAdmin(user.type() === 'administrator');
      session.isManager(user.type() !== 'commuter');
      session.isLoggedIn(true);

      callback(null, user);
    } else {
      callback(err);
    }
  });
};

/**
 * Log out
 */

module.exports.logout = function(ctx) {
  debug('logout %s', ctx.path);

  session.isAdmin(false);
  session.isLoggedIn(false);
  session.isManager(false);
  session.user(null);

  request.get('/logout', function(err, res) {
    document.cookie = null;
    page('/manager/login');
  });
};

/**
 * Redirect to `/login` if not logged in middleware
 */

module.exports.checkIfLoggedIn = function(ctx, next) {
  debug('check if user is logged in %s', ctx.path);

  if (session.user()) {
    session.isLoggedIn(true);
    session.isAdmin(session.user().type() === 'administrator');
    session.isManager(session.user().type() !== 'commuter');
    next();
  } else {
    request.get('/is-logged-in', function(err, res) {
      if (err || !res.ok) {
        session.isLoggedIn(false);
        session.isAdmin(false);
        session.isManager(false);
        session.user(null);
        page('/manager/login');
      } else {
        session.user(new User(res.body));
        session.isLoggedIn(true);
        session.isAdmin(res.body.type === 'administrator');
        session.isManager(res.body.type !== 'commuter');
        next();
      }
    });
  }
};

/**
 * Check if admin
 */

module.exports.checkIfAdmin = function(ctx, next) {
  debug('is admin %s', ctx.path);
  if (session.user().type() !== 'administrator') {
    page('/manager/organizations');
  } else {
    next();
  }
};

/**
 * Check if manager
 */

module.exports.checkIfManager = function(ctx, next) {
  debug('is manager %s', ctx.path);
  if (session.user().type() === 'commuter') {
    page('/manager/login');
  } else {
    next();
  }
};

});
require.register("manager-app/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var Nav = require('manager-nav');
var router = require('manager-router');
var onLoad = require('on-load');
var page = require('page');
var session = require('session');

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function() {
  // display nav
  var nav = new Nav(session);
  document.body.insertBefore(nav.el, document.body.firstChild);

  // set base
  page.base('/manager');

  // listen
  page();
});

});
require.register("mbostock-d3/d3.js", function(exports, require, module){
!function() {
  var d3 = {
    version: "3.4.2"
  };
  if (!Date.now) Date.now = function() {
    return +new Date();
  };
  var d3_arraySlice = [].slice, d3_array = function(list) {
    return d3_arraySlice.call(list);
  };
  var d3_document = document, d3_documentElement = d3_document.documentElement, d3_window = window;
  try {
    d3_array(d3_documentElement.childNodes)[0].nodeType;
  } catch (e) {
    d3_array = function(list) {
      var i = list.length, array = new Array(i);
      while (i--) array[i] = list[i];
      return array;
    };
  }
  try {
    d3_document.createElement("div").style.setProperty("opacity", 0, "");
  } catch (error) {
    var d3_element_prototype = d3_window.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = d3_window.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
    d3_element_prototype.setAttribute = function(name, value) {
      d3_element_setAttribute.call(this, name, value + "");
    };
    d3_element_prototype.setAttributeNS = function(space, local, value) {
      d3_element_setAttributeNS.call(this, space, local, value + "");
    };
    d3_style_prototype.setProperty = function(name, value, priority) {
      d3_style_setProperty.call(this, name, value + "", priority);
    };
  }
  d3.ascending = function(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  };
  d3.descending = function(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  };
  d3.min = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n && !((a = array[i]) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    } else {
      while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
    }
    return a;
  };
  d3.max = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n && !((a = array[i]) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    } else {
      while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
    }
    return a;
  };
  d3.extent = function(array, f) {
    var i = -1, n = array.length, a, b, c;
    if (arguments.length === 1) {
      while (++i < n && !((a = c = array[i]) != null && a <= a)) a = c = undefined;
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    } else {
      while (++i < n && !((a = c = f.call(array, array[i], i)) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }
    return [ a, c ];
  };
  d3.sum = function(array, f) {
    var s = 0, n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (!isNaN(a = +array[i])) s += a;
    } else {
      while (++i < n) if (!isNaN(a = +f.call(array, array[i], i))) s += a;
    }
    return s;
  };
  function d3_number(x) {
    return x != null && !isNaN(x);
  }
  d3.mean = function(array, f) {
    var n = array.length, a, m = 0, i = -1, j = 0;
    if (arguments.length === 1) {
      while (++i < n) if (d3_number(a = array[i])) m += (a - m) / ++j;
    } else {
      while (++i < n) if (d3_number(a = f.call(array, array[i], i))) m += (a - m) / ++j;
    }
    return j ? m : undefined;
  };
  d3.quantile = function(values, p) {
    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
    return e ? v + e * (values[h] - v) : v;
  };
  d3.median = function(array, f) {
    if (arguments.length > 1) array = array.map(f);
    array = array.filter(d3_number);
    return array.length ? d3.quantile(array.sort(d3.ascending), .5) : undefined;
  };
  d3.bisector = function(f) {
    return {
      left: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (f.call(a, a[mid], mid) < x) lo = mid + 1; else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (x < f.call(a, a[mid], mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
      }
    };
  };
  var d3_bisector = d3.bisector(function(d) {
    return d;
  });
  d3.bisectLeft = d3_bisector.left;
  d3.bisect = d3.bisectRight = d3_bisector.right;
  d3.shuffle = function(array) {
    var m = array.length, t, i;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m], array[m] = array[i], array[i] = t;
    }
    return array;
  };
  d3.permute = function(array, indexes) {
    var i = indexes.length, permutes = new Array(i);
    while (i--) permutes[i] = array[indexes[i]];
    return permutes;
  };
  d3.pairs = function(array) {
    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
    return pairs;
  };
  d3.zip = function() {
    if (!(n = arguments.length)) return [];
    for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m; ) {
      for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n; ) {
        zip[j] = arguments[j][i];
      }
    }
    return zips;
  };
  function d3_zipLength(d) {
    return d.length;
  }
  d3.transpose = function(matrix) {
    return d3.zip.apply(d3, matrix);
  };
  d3.keys = function(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  };
  d3.values = function(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  };
  d3.entries = function(map) {
    var entries = [];
    for (var key in map) entries.push({
      key: key,
      value: map[key]
    });
    return entries;
  };
  d3.merge = function(arrays) {
    var n = arrays.length, m, i = -1, j = 0, merged, array;
    while (++i < n) j += arrays[i].length;
    merged = new Array(j);
    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }
    return merged;
  };
  var abs = Math.abs;
  d3.range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }
  function d3_class(ctor, properties) {
    try {
      for (var key in properties) {
        Object.defineProperty(ctor.prototype, key, {
          value: properties[key],
          enumerable: false
        });
      }
    } catch (e) {
      ctor.prototype = properties;
    }
  }
  d3.map = function(object) {
    var map = new d3_Map();
    if (object instanceof d3_Map) object.forEach(function(key, value) {
      map.set(key, value);
    }); else for (var key in object) map.set(key, object[key]);
    return map;
  };
  function d3_Map() {}
  d3_class(d3_Map, {
    has: d3_map_has,
    get: function(key) {
      return this[d3_map_prefix + key];
    },
    set: function(key, value) {
      return this[d3_map_prefix + key] = value;
    },
    remove: d3_map_remove,
    keys: d3_map_keys,
    values: function() {
      var values = [];
      this.forEach(function(key, value) {
        values.push(value);
      });
      return values;
    },
    entries: function() {
      var entries = [];
      this.forEach(function(key, value) {
        entries.push({
          key: key,
          value: value
        });
      });
      return entries;
    },
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) f.call(this, key.substring(1), this[key]);
    }
  });
  var d3_map_prefix = "\x00", d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
  function d3_map_has(key) {
    return d3_map_prefix + key in this;
  }
  function d3_map_remove(key) {
    key = d3_map_prefix + key;
    return key in this && delete this[key];
  }
  function d3_map_keys() {
    var keys = [];
    this.forEach(function(key) {
      keys.push(key);
    });
    return keys;
  }
  function d3_map_size() {
    var size = 0;
    for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) ++size;
    return size;
  }
  function d3_map_empty() {
    for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) return false;
    return true;
  }
  d3.nest = function() {
    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
    function map(mapType, array, depth) {
      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [ object ]);
        }
      }
      if (mapType) {
        object = mapType();
        setter = function(keyValue, values) {
          object.set(keyValue, map(mapType, values, depth));
        };
      } else {
        object = {};
        setter = function(keyValue, values) {
          object[keyValue] = map(mapType, values, depth);
        };
      }
      valuesByKey.forEach(setter);
      return object;
    }
    function entries(map, depth) {
      if (depth >= keys.length) return map;
      var array = [], sortKey = sortKeys[depth++];
      map.forEach(function(key, keyMap) {
        array.push({
          key: key,
          values: entries(keyMap, depth)
        });
      });
      return sortKey ? array.sort(function(a, b) {
        return sortKey(a.key, b.key);
      }) : array;
    }
    nest.map = function(array, mapType) {
      return map(mapType, array, 0);
    };
    nest.entries = function(array) {
      return entries(map(d3.map, array, 0), 0);
    };
    nest.key = function(d) {
      keys.push(d);
      return nest;
    };
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };
    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };
    return nest;
  };
  d3.set = function(array) {
    var set = new d3_Set();
    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
    return set;
  };
  function d3_Set() {}
  d3_class(d3_Set, {
    has: d3_map_has,
    add: function(value) {
      this[d3_map_prefix + value] = true;
      return value;
    },
    remove: function(value) {
      value = d3_map_prefix + value;
      return value in this && delete this[value];
    },
    values: d3_map_keys,
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var value in this) if (value.charCodeAt(0) === d3_map_prefixCode) f.call(this, value.substring(1));
    }
  });
  d3.behavior = {};
  d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }
  function d3_vendorSymbol(object, name) {
    if (name in object) return name;
    name = name.charAt(0).toUpperCase() + name.substring(1);
    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
      var prefixName = d3_vendorPrefixes[i] + name;
      if (prefixName in object) return prefixName;
    }
  }
  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
  function d3_noop() {}
  d3.dispatch = function() {
    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    return dispatch;
  };
  function d3_dispatch() {}
  d3_dispatch.prototype.on = function(type, listener) {
    var i = type.indexOf("."), name = "";
    if (i >= 0) {
      name = type.substring(i + 1);
      type = type.substring(0, i);
    }
    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
    if (arguments.length === 2) {
      if (listener == null) for (type in this) {
        if (this.hasOwnProperty(type)) this[type].on(name, null);
      }
      return this;
    }
  };
  function d3_dispatch_event(dispatch) {
    var listeners = [], listenerByName = new d3_Map();
    function event() {
      var z = listeners, i = -1, n = z.length, l;
      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
      return dispatch;
    }
    event.on = function(name, listener) {
      var l = listenerByName.get(name), i;
      if (arguments.length < 2) return l && l.on;
      if (l) {
        l.on = null;
        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
        listenerByName.remove(name);
      }
      if (listener) listeners.push(listenerByName.set(name, {
        on: listener
      }));
      return dispatch;
    };
    return event;
  }
  d3.event = null;
  function d3_eventPreventDefault() {
    d3.event.preventDefault();
  }
  function d3_eventSource() {
    var e = d3.event, s;
    while (s = e.sourceEvent) e = s;
    return e;
  }
  function d3_eventDispatch(target) {
    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    dispatch.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 = e1.sourceEvent = d3.event;
          e1.target = target;
          d3.event = e1;
          dispatch[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };
    return dispatch;
  }
  d3.requote = function(s) {
    return s.replace(d3_requote_re, "\\$&");
  };
  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  var d3_subclass = {}.__proto__ ? function(object, prototype) {
    object.__proto__ = prototype;
  } : function(object, prototype) {
    for (var property in prototype) object[property] = prototype[property];
  };
  function d3_selection(groups) {
    d3_subclass(groups, d3_selectionPrototype);
    return groups;
  }
  var d3_select = function(s, n) {
    return n.querySelector(s);
  }, d3_selectAll = function(s, n) {
    return n.querySelectorAll(s);
  }, d3_selectMatcher = d3_documentElement[d3_vendorSymbol(d3_documentElement, "matchesSelector")], d3_selectMatches = function(n, s) {
    return d3_selectMatcher.call(n, s);
  };
  if (typeof Sizzle === "function") {
    d3_select = function(s, n) {
      return Sizzle(s, n)[0] || null;
    };
    d3_selectAll = function(s, n) {
      return Sizzle.uniqueSort(Sizzle(s, n));
    };
    d3_selectMatches = Sizzle.matchesSelector;
  }
  d3.selection = function() {
    return d3_selectionRoot;
  };
  var d3_selectionPrototype = d3.selection.prototype = [];
  d3_selectionPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, group, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selector(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_select(selector, this);
    };
  }
  d3_selectionPrototype.selectAll = function(selector) {
    var subgroups = [], subgroup, node;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
          subgroup.parentNode = node;
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selectorAll(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_selectAll(selector, this);
    };
  }
  var d3_nsPrefix = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  d3.ns = {
    prefix: d3_nsPrefix,
    qualify: function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0) {
        prefix = name.substring(0, i);
        name = name.substring(i + 1);
      }
      return d3_nsPrefix.hasOwnProperty(prefix) ? {
        space: d3_nsPrefix[prefix],
        local: name
      } : name;
    }
  };
  d3_selectionPrototype.attr = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node();
        name = d3.ns.qualify(name);
        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
      }
      for (value in name) this.each(d3_selection_attr(value, name[value]));
      return this;
    }
    return this.each(d3_selection_attr(name, value));
  };
  function d3_selection_attr(name, value) {
    name = d3.ns.qualify(name);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrConstant() {
      this.setAttribute(name, value);
    }
    function attrConstantNS() {
      this.setAttributeNS(name.space, name.local, value);
    }
    function attrFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
    }
    function attrFunctionNS() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
    }
    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
  }
  function d3_collapse(s) {
    return s.trim().replace(/\s+/g, " ");
  }
  d3_selectionPrototype.classed = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
        if (value = node.classList) {
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.getAttribute("class");
          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
        }
        return true;
      }
      for (value in name) this.each(d3_selection_classed(value, name[value]));
      return this;
    }
    return this.each(d3_selection_classed(name, value));
  };
  function d3_selection_classedRe(name) {
    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
  }
  function d3_selection_classes(name) {
    return name.trim().split(/^|\s+/);
  }
  function d3_selection_classed(name, value) {
    name = d3_selection_classes(name).map(d3_selection_classedName);
    var n = name.length;
    function classedConstant() {
      var i = -1;
      while (++i < n) name[i](this, value);
    }
    function classedFunction() {
      var i = -1, x = value.apply(this, arguments);
      while (++i < n) name[i](this, x);
    }
    return typeof value === "function" ? classedFunction : classedConstant;
  }
  function d3_selection_classedName(name) {
    var re = d3_selection_classedRe(name);
    return function(node, value) {
      if (c = node.classList) return value ? c.add(name) : c.remove(name);
      var c = node.getAttribute("class") || "";
      if (value) {
        re.lastIndex = 0;
        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
      } else {
        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
      }
    };
  }
  d3_selectionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
        return this;
      }
      if (n < 2) return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);
      priority = "";
    }
    return this.each(d3_selection_style(name, value, priority));
  };
  function d3_selection_style(name, value, priority) {
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleConstant() {
      this.style.setProperty(name, value, priority);
    }
    function styleFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
    }
    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
  }
  d3_selectionPrototype.property = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") return this.node()[name];
      for (value in name) this.each(d3_selection_property(value, name[value]));
      return this;
    }
    return this.each(d3_selection_property(name, value));
  };
  function d3_selection_property(name, value) {
    function propertyNull() {
      delete this[name];
    }
    function propertyConstant() {
      this[name] = value;
    }
    function propertyFunction() {
      var x = value.apply(this, arguments);
      if (x == null) delete this[name]; else this[name] = x;
    }
    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
  }
  d3_selectionPrototype.text = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    } : value == null ? function() {
      this.textContent = "";
    } : function() {
      this.textContent = value;
    }) : this.node().textContent;
  };
  d3_selectionPrototype.html = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    } : value == null ? function() {
      this.innerHTML = "";
    } : function() {
      this.innerHTML = value;
    }) : this.node().innerHTML;
  };
  d3_selectionPrototype.append = function(name) {
    name = d3_selection_creator(name);
    return this.select(function() {
      return this.appendChild(name.apply(this, arguments));
    });
  };
  function d3_selection_creator(name) {
    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? function() {
      return this.ownerDocument.createElementNS(name.space, name.local);
    } : function() {
      return this.ownerDocument.createElementNS(this.namespaceURI, name);
    };
  }
  d3_selectionPrototype.insert = function(name, before) {
    name = d3_selection_creator(name);
    before = d3_selection_selector(before);
    return this.select(function() {
      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
    });
  };
  d3_selectionPrototype.remove = function() {
    return this.each(function() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    });
  };
  d3_selectionPrototype.data = function(value, key) {
    var i = -1, n = this.length, group, node;
    if (!arguments.length) {
      value = new Array(n = (group = this[0]).length);
      while (++i < n) {
        if (node = group[i]) {
          value[i] = node.__data__;
        }
      }
      return value;
    }
    function bind(group, groupData) {
      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
      if (key) {
        var nodeByKeyValue = new d3_Map(), dataByKeyValue = new d3_Map(), keyValues = [], keyValue;
        for (i = -1; ++i < n; ) {
          keyValue = key.call(node = group[i], node.__data__, i);
          if (nodeByKeyValue.has(keyValue)) {
            exitNodes[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
          keyValues.push(keyValue);
        }
        for (i = -1; ++i < m; ) {
          keyValue = key.call(groupData, nodeData = groupData[i], i);
          if (node = nodeByKeyValue.get(keyValue)) {
            updateNodes[i] = node;
            node.__data__ = nodeData;
          } else if (!dataByKeyValue.has(keyValue)) {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
          dataByKeyValue.set(keyValue, nodeData);
          nodeByKeyValue.remove(keyValue);
        }
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.has(keyValues[i])) {
            exitNodes[i] = group[i];
          }
        }
      } else {
        for (i = -1; ++i < n0; ) {
          node = group[i];
          nodeData = groupData[i];
          if (node) {
            node.__data__ = nodeData;
            updateNodes[i] = node;
          } else {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
        }
        for (;i < m; ++i) {
          enterNodes[i] = d3_selection_dataNode(groupData[i]);
        }
        for (;i < n; ++i) {
          exitNodes[i] = group[i];
        }
      }
      enterNodes.update = updateNodes;
      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
      enter.push(enterNodes);
      update.push(updateNodes);
      exit.push(exitNodes);
    }
    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
    if (typeof value === "function") {
      while (++i < n) {
        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
      }
    } else {
      while (++i < n) {
        bind(group = this[i], value);
      }
    }
    update.enter = function() {
      return enter;
    };
    update.exit = function() {
      return exit;
    };
    return update;
  };
  function d3_selection_dataNode(data) {
    return {
      __data__: data
    };
  }
  d3_selectionPrototype.datum = function(value) {
    return arguments.length ? this.property("__data__", value) : this.property("__data__");
  };
  d3_selectionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_filter(selector) {
    return function() {
      return d3_selectMatches(this, selector);
    };
  }
  d3_selectionPrototype.order = function() {
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  };
  d3_selectionPrototype.sort = function(comparator) {
    comparator = d3_selection_sortComparator.apply(this, arguments);
    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
    return this.order();
  };
  function d3_selection_sortComparator(comparator) {
    if (!arguments.length) comparator = d3.ascending;
    return function(a, b) {
      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
    };
  }
  d3_selectionPrototype.each = function(callback) {
    return d3_selection_each(this, function(node, i, j) {
      callback.call(node, node.__data__, i, j);
    });
  };
  function d3_selection_each(groups, callback) {
    for (var j = 0, m = groups.length; j < m; j++) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
        if (node = group[i]) callback(node, i, j);
      }
    }
    return groups;
  }
  d3_selectionPrototype.call = function(callback) {
    var args = d3_array(arguments);
    callback.apply(args[0] = this, args);
    return this;
  };
  d3_selectionPrototype.empty = function() {
    return !this.node();
  };
  d3_selectionPrototype.node = function() {
    for (var j = 0, m = this.length; j < m; j++) {
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  };
  d3_selectionPrototype.size = function() {
    var n = 0;
    this.each(function() {
      ++n;
    });
    return n;
  };
  function d3_selection_enter(selection) {
    d3_subclass(selection, d3_selection_enterPrototype);
    return selection;
  }
  var d3_selection_enterPrototype = [];
  d3.selection.enter = d3_selection_enter;
  d3.selection.enter.prototype = d3_selection_enterPrototype;
  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
  d3_selection_enterPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, upgroup, group, node;
    for (var j = -1, m = this.length; ++j < m; ) {
      upgroup = (group = this[j]).update;
      subgroups.push(subgroup = []);
      subgroup.parentNode = group.parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
          subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  d3_selection_enterPrototype.insert = function(name, before) {
    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
    return d3_selectionPrototype.insert.call(this, name, before);
  };
  function d3_selection_enterInsertBefore(enter) {
    var i0, j0;
    return function(d, i, j) {
      var group = enter[j].update, n = group.length, node;
      if (j != j0) j0 = j, i0 = 0;
      if (i >= i0) i0 = i + 1;
      while (!(node = group[i0]) && ++i0 < n) ;
      return node;
    };
  }
  d3_selectionPrototype.transition = function() {
    var id = d3_transitionInheritId || ++d3_transitionId, subgroups = [], subgroup, node, transition = d3_transitionInherit || {
      time: Date.now(),
      ease: d3_ease_cubicInOut,
      delay: 0,
      duration: 250
    };
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) d3_transitionNode(node, i, id, transition);
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_selectionPrototype.interrupt = function() {
    return this.each(d3_selection_interrupt);
  };
  function d3_selection_interrupt() {
    var lock = this.__transition__;
    if (lock) ++lock.active;
  }
  d3.select = function(node) {
    var group = [ typeof node === "string" ? d3_select(node, d3_document) : node ];
    group.parentNode = d3_documentElement;
    return d3_selection([ group ]);
  };
  d3.selectAll = function(nodes) {
    var group = d3_array(typeof nodes === "string" ? d3_selectAll(nodes, d3_document) : nodes);
    group.parentNode = d3_documentElement;
    return d3_selection([ group ]);
  };
  var d3_selectionRoot = d3.select(d3_documentElement);
  d3_selectionPrototype.on = function(type, listener, capture) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof type !== "string") {
        if (n < 2) listener = false;
        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
        return this;
      }
      if (n < 2) return (n = this.node()["__on" + type]) && n._;
      capture = false;
    }
    return this.each(d3_selection_on(type, listener, capture));
  };
  function d3_selection_on(type, listener, capture) {
    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
    if (i > 0) type = type.substring(0, i);
    var filter = d3_selection_onFilters.get(type);
    if (filter) type = filter, wrap = d3_selection_onFilter;
    function onRemove() {
      var l = this[name];
      if (l) {
        this.removeEventListener(type, l, l.$);
        delete this[name];
      }
    }
    function onAdd() {
      var l = wrap(listener, d3_array(arguments));
      onRemove.call(this);
      this.addEventListener(type, this[name] = l, l.$ = capture);
      l._ = listener;
    }
    function removeAll() {
      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
      for (var name in this) {
        if (match = name.match(re)) {
          var l = this[name];
          this.removeEventListener(match[1], l, l.$);
          delete this[name];
        }
      }
    }
    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
  }
  var d3_selection_onFilters = d3.map({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  });
  d3_selection_onFilters.forEach(function(k) {
    if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
  });
  function d3_selection_onListener(listener, argumentz) {
    return function(e) {
      var o = d3.event;
      d3.event = e;
      argumentz[0] = this.__data__;
      try {
        listener.apply(this, argumentz);
      } finally {
        d3.event = o;
      }
    };
  }
  function d3_selection_onFilter(listener, argumentz) {
    var l = d3_selection_onListener(listener, argumentz);
    return function(e) {
      var target = this, related = e.relatedTarget;
      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
        l.call(target, e);
      }
    };
  }
  var d3_event_dragSelect = "onselectstart" in d3_document ? null : d3_vendorSymbol(d3_documentElement.style, "userSelect"), d3_event_dragId = 0;
  function d3_event_dragSuppress() {
    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
    if (d3_event_dragSelect) {
      var style = d3_documentElement.style, select = style[d3_event_dragSelect];
      style[d3_event_dragSelect] = "none";
    }
    return function(suppressClick) {
      w.on(name, null);
      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
      if (suppressClick) {
        function off() {
          w.on(click, null);
        }
        w.on(click, function() {
          d3_eventPreventDefault();
          off();
        }, true);
        setTimeout(off, 0);
      }
    };
  }
  d3.mouse = function(container) {
    return d3_mousePoint(container, d3_eventSource());
  };
  var d3_mouse_bug44083 = /WebKit/.test(d3_window.navigator.userAgent) ? -1 : 0;
  function d3_mousePoint(container, e) {
    if (e.changedTouches) e = e.changedTouches[0];
    var svg = container.ownerSVGElement || container;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      if (d3_mouse_bug44083 < 0 && (d3_window.scrollX || d3_window.scrollY)) {
        svg = d3.select("body").append("svg").style({
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          border: "none"
        }, "important");
        var ctm = svg[0][0].getScreenCTM();
        d3_mouse_bug44083 = !(ctm.f || ctm.e);
        svg.remove();
      }
      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
      point.y = e.clientY;
      point = point.matrixTransform(container.getScreenCTM().inverse());
      return [ point.x, point.y ];
    }
    var rect = container.getBoundingClientRect();
    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
  }
  d3.touches = function(container, touches) {
    if (arguments.length < 2) touches = d3_eventSource().touches;
    return touches ? d3_array(touches).map(function(touch) {
      var point = d3_mousePoint(container, touch);
      point.identifier = touch.identifier;
      return point;
    }) : [];
  };
  d3.behavior.drag = function() {
    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, "mousemove", "mouseup"), touchstart = dragstart(touchid, touchposition, "touchmove", "touchend");
    function drag() {
      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
    }
    function touchid() {
      return d3.event.changedTouches[0].identifier;
    }
    function touchposition(parent, id) {
      return d3.touches(parent).filter(function(p) {
        return p.identifier === id;
      })[0];
    }
    function dragstart(id, position, move, end) {
      return function() {
        var target = this, parent = target.parentNode, event_ = event.of(target, arguments), eventTarget = d3.event.target, eventId = id(), drag = eventId == null ? "drag" : "drag-" + eventId, origin_ = position(parent, eventId), dragged = 0, offset, w = d3.select(d3_window).on(move + "." + drag, moved).on(end + "." + drag, ended), dragRestore = d3_event_dragSuppress();
        if (origin) {
          offset = origin.apply(target, arguments);
          offset = [ offset.x - origin_[0], offset.y - origin_[1] ];
        } else {
          offset = [ 0, 0 ];
        }
        event_({
          type: "dragstart"
        });
        function moved() {
          var p = position(parent, eventId), dx = p[0] - origin_[0], dy = p[1] - origin_[1];
          dragged |= dx | dy;
          origin_ = p;
          event_({
            type: "drag",
            x: p[0] + offset[0],
            y: p[1] + offset[1],
            dx: dx,
            dy: dy
          });
        }
        function ended() {
          w.on(move + "." + drag, null).on(end + "." + drag, null);
          dragRestore(dragged && d3.event.target === eventTarget);
          event_({
            type: "dragend"
          });
        }
      };
    }
    drag.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return drag;
    };
    return d3.rebind(drag, event, "on");
  };
  var π = Math.PI, τ = 2 * π, halfπ = π / 2, ε = 1e-6, ε2 = ε * ε, d3_radians = π / 180, d3_degrees = 180 / π;
  function d3_sgn(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  function d3_cross2d(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }
  function d3_acos(x) {
    return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
  }
  function d3_asin(x) {
    return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
  }
  function d3_sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function d3_cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function d3_tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  function d3_haversin(x) {
    return (x = Math.sin(x / 2)) * x;
  }
  var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
  d3.interpolateZoom = function(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
    var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), dr = r1 - r0, S = (dr || Math.log(w1 / w0)) / ρ;
    function interpolate(t) {
      var s = t * S;
      if (dr) {
        var coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0) ];
      }
      return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * s) ];
    }
    interpolate.duration = S * 1e3;
    return interpolate;
  };
  d3.behavior.zoom = function() {
    var view = {
      x: 0,
      y: 0,
      k: 1
    }, translate0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
    function zoom(g) {
      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on(mousemove, mousewheelreset).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
    }
    zoom.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments), view1 = view;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.zoom", function() {
            view = this.__chart__ || {
              x: 0,
              y: 0,
              k: 1
            };
            zoomstarted(event_);
          }).tween("zoom:zoom", function() {
            var dx = size[0], dy = size[1], cx = dx / 2, cy = dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
            return function(t) {
              var l = i(t), k = dx / l[2];
              this.__chart__ = view = {
                x: cx - l[0] * k,
                y: cy - l[1] * k,
                k: k
              };
              zoomed(event_);
            };
          }).each("end.zoom", function() {
            zoomended(event_);
          });
        } else {
          this.__chart__ = view;
          zoomstarted(event_);
          zoomed(event_);
          zoomended(event_);
        }
      });
    };
    zoom.translate = function(_) {
      if (!arguments.length) return [ view.x, view.y ];
      view = {
        x: +_[0],
        y: +_[1],
        k: view.k
      };
      rescale();
      return zoom;
    };
    zoom.scale = function(_) {
      if (!arguments.length) return view.k;
      view = {
        x: view.x,
        y: view.y,
        k: +_
      };
      rescale();
      return zoom;
    };
    zoom.scaleExtent = function(_) {
      if (!arguments.length) return scaleExtent;
      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.center = function(_) {
      if (!arguments.length) return center;
      center = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.size = function(_) {
      if (!arguments.length) return size;
      size = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.x = function(z) {
      if (!arguments.length) return x1;
      x1 = z;
      x0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    zoom.y = function(z) {
      if (!arguments.length) return y1;
      y1 = z;
      y0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    function location(p) {
      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
    }
    function point(l) {
      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
    }
    function scaleTo(s) {
      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
    }
    function translateTo(p, l) {
      l = point(l);
      view.x += p[0] - l[0];
      view.y += p[1] - l[1];
    }
    function rescale() {
      if (x1) x1.domain(x0.range().map(function(x) {
        return (x - view.x) / view.k;
      }).map(x0.invert));
      if (y1) y1.domain(y0.range().map(function(y) {
        return (y - view.y) / view.k;
      }).map(y0.invert));
    }
    function zoomstarted(event) {
      event({
        type: "zoomstart"
      });
    }
    function zoomed(event) {
      rescale();
      event({
        type: "zoom",
        scale: view.k,
        translate: [ view.x, view.y ]
      });
    }
    function zoomended(event) {
      event({
        type: "zoomend"
      });
    }
    function mousedowned() {
      var target = this, event_ = event.of(target, arguments), eventTarget = d3.event.target, dragged = 0, w = d3.select(d3_window).on(mousemove, moved).on(mouseup, ended), l = location(d3.mouse(target)), dragRestore = d3_event_dragSuppress();
      d3_selection_interrupt.call(target);
      zoomstarted(event_);
      function moved() {
        dragged = 1;
        translateTo(d3.mouse(target), l);
        zoomed(event_);
      }
      function ended() {
        w.on(mousemove, d3_window === target ? mousewheelreset : null).on(mouseup, null);
        dragRestore(dragged && d3.event.target === eventTarget);
        zoomended(event_);
      }
    }
    function touchstarted() {
      var target = this, event_ = event.of(target, arguments), locations0 = {}, distance0 = 0, scale0, eventId = d3.event.changedTouches[0].identifier, touchmove = "touchmove.zoom-" + eventId, touchend = "touchend.zoom-" + eventId, w = d3.select(d3_window).on(touchmove, moved).on(touchend, ended), t = d3.select(target).on(mousedown, null).on(touchstart, started), dragRestore = d3_event_dragSuppress();
      d3_selection_interrupt.call(target);
      started();
      zoomstarted(event_);
      function relocate() {
        var touches = d3.touches(target);
        scale0 = view.k;
        touches.forEach(function(t) {
          if (t.identifier in locations0) locations0[t.identifier] = location(t);
        });
        return touches;
      }
      function started() {
        var changed = d3.event.changedTouches;
        for (var i = 0, n = changed.length; i < n; ++i) {
          locations0[changed[i].identifier] = null;
        }
        var touches = relocate(), now = Date.now();
        if (touches.length === 1) {
          if (now - touchtime < 500) {
            var p = touches[0], l = locations0[p.identifier];
            scaleTo(view.k * 2);
            translateTo(p, l);
            d3_eventPreventDefault();
            zoomed(event_);
          }
          touchtime = now;
        } else if (touches.length > 1) {
          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
          distance0 = dx * dx + dy * dy;
        }
      }
      function moved() {
        var touches = d3.touches(target), p0, l0, p1, l1;
        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
          p1 = touches[i];
          if (l1 = locations0[p1.identifier]) {
            if (l0) break;
            p0 = p1, l0 = l1;
          }
        }
        if (l1) {
          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
          scaleTo(scale1 * scale0);
        }
        touchtime = null;
        translateTo(p0, l0);
        zoomed(event_);
      }
      function ended() {
        if (d3.event.touches.length) {
          var changed = d3.event.changedTouches;
          for (var i = 0, n = changed.length; i < n; ++i) {
            delete locations0[changed[i].identifier];
          }
          for (var identifier in locations0) {
            return void relocate();
          }
        }
        w.on(touchmove, null).on(touchend, null);
        t.on(mousedown, mousedowned).on(touchstart, touchstarted);
        dragRestore();
        zoomended(event_);
      }
    }
    function mousewheeled() {
      var event_ = event.of(this, arguments);
      if (mousewheelTimer) clearTimeout(mousewheelTimer); else d3_selection_interrupt.call(this), 
      zoomstarted(event_);
      mousewheelTimer = setTimeout(function() {
        mousewheelTimer = null;
        zoomended(event_);
      }, 50);
      d3_eventPreventDefault();
      var point = center || d3.mouse(this);
      if (!translate0) translate0 = location(point);
      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
      translateTo(point, translate0);
      zoomed(event_);
    }
    function mousewheelreset() {
      translate0 = null;
    }
    function dblclicked() {
      var event_ = event.of(this, arguments), p = d3.mouse(this), l = location(p), k = Math.log(view.k) / Math.LN2;
      zoomstarted(event_);
      scaleTo(Math.pow(2, d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1));
      translateTo(p, l);
      zoomed(event_);
      zoomended(event_);
    }
    return d3.rebind(zoom, event, "on");
  };
  var d3_behavior_zoomInfinity = [ 0, Infinity ];
  var d3_behavior_zoomDelta, d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
    return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
  }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
    return d3.event.wheelDelta;
  }, "mousewheel") : (d3_behavior_zoomDelta = function() {
    return -d3.event.detail;
  }, "MozMousePixelScroll");
  function d3_Color() {}
  d3_Color.prototype.toString = function() {
    return this.rgb() + "";
  };
  d3.hsl = function(h, s, l) {
    return arguments.length === 1 ? h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : d3_hsl(+h, +s, +l);
  };
  function d3_hsl(h, s, l) {
    return new d3_Hsl(h, s, l);
  }
  function d3_Hsl(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
  }
  var d3_hslPrototype = d3_Hsl.prototype = new d3_Color();
  d3_hslPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_hsl(this.h, this.s, this.l / k);
  };
  d3_hslPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_hsl(this.h, this.s, k * this.l);
  };
  d3_hslPrototype.rgb = function() {
    return d3_hsl_rgb(this.h, this.s, this.l);
  };
  function d3_hsl_rgb(h, s, l) {
    var m1, m2;
    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
    m1 = 2 * l - m2;
    function v(h) {
      if (h > 360) h -= 360; else if (h < 0) h += 360;
      if (h < 60) return m1 + (m2 - m1) * h / 60;
      if (h < 180) return m2;
      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
      return m1;
    }
    function vv(h) {
      return Math.round(v(h) * 255);
    }
    return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
  }
  d3.hcl = function(h, c, l) {
    return arguments.length === 1 ? h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l) : h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : d3_hcl(+h, +c, +l);
  };
  function d3_hcl(h, c, l) {
    return new d3_Hcl(h, c, l);
  }
  function d3_Hcl(h, c, l) {
    this.h = h;
    this.c = c;
    this.l = l;
  }
  var d3_hclPrototype = d3_Hcl.prototype = new d3_Color();
  d3_hclPrototype.brighter = function(k) {
    return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.darker = function(k) {
    return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.rgb = function() {
    return d3_hcl_lab(this.h, this.c, this.l).rgb();
  };
  function d3_hcl_lab(h, c, l) {
    if (isNaN(h)) h = 0;
    if (isNaN(c)) c = 0;
    return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
  }
  d3.lab = function(l, a, b) {
    return arguments.length === 1 ? l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b) : l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h) : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b) : d3_lab(+l, +a, +b);
  };
  function d3_lab(l, a, b) {
    return new d3_Lab(l, a, b);
  }
  function d3_Lab(l, a, b) {
    this.l = l;
    this.a = a;
    this.b = b;
  }
  var d3_lab_K = 18;
  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
  var d3_labPrototype = d3_Lab.prototype = new d3_Color();
  d3_labPrototype.brighter = function(k) {
    return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.darker = function(k) {
    return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.rgb = function() {
    return d3_lab_rgb(this.l, this.a, this.b);
  };
  function d3_lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = d3_lab_xyz(x) * d3_lab_X;
    y = d3_lab_xyz(y) * d3_lab_Y;
    z = d3_lab_xyz(z) * d3_lab_Z;
    return d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
  }
  function d3_lab_hcl(l, a, b) {
    return l > 0 ? d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : d3_hcl(NaN, NaN, l);
  }
  function d3_lab_xyz(x) {
    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }
  function d3_xyz_lab(x) {
    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }
  function d3_xyz_rgb(r) {
    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
  }
  d3.rgb = function(r, g, b) {
    return arguments.length === 1 ? r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : d3_rgb(~~r, ~~g, ~~b);
  };
  function d3_rgbNumber(value) {
    return d3_rgb(value >> 16, value >> 8 & 255, value & 255);
  }
  function d3_rgbString(value) {
    return d3_rgbNumber(value) + "";
  }
  function d3_rgb(r, g, b) {
    return new d3_Rgb(r, g, b);
  }
  function d3_Rgb(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color();
  d3_rgbPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return d3_rgb(Math.min(255, ~~(r / k)), Math.min(255, ~~(g / k)), Math.min(255, ~~(b / k)));
  };
  d3_rgbPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return d3_rgb(~~(k * this.r), ~~(k * this.g), ~~(k * this.b));
  };
  d3_rgbPrototype.hsl = function() {
    return d3_rgb_hsl(this.r, this.g, this.b);
  };
  d3_rgbPrototype.toString = function() {
    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
  };
  function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
  }
  function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, name;
    m1 = /([a-z]+)\((.*)\)/i.exec(format);
    if (m1) {
      m2 = m1[2].split(",");
      switch (m1[1]) {
       case "hsl":
        {
          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
        }

       case "rgb":
        {
          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
        }
      }
    }
    if (name = d3_rgb_names.get(format)) return rgb(name.r, name.g, name.b);
    if (format != null && format.charAt(0) === "#") {
      if (format.length === 4) {
        r = format.charAt(1);
        r += r;
        g = format.charAt(2);
        g += g;
        b = format.charAt(3);
        b += b;
      } else if (format.length === 7) {
        r = format.substring(1, 3);
        g = format.substring(3, 5);
        b = format.substring(5, 7);
      }
      r = parseInt(r, 16);
      g = parseInt(g, 16);
      b = parseInt(b, 16);
    }
    return rgb(r, g, b);
  }
  function d3_rgb_hsl(r, g, b) {
    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
    if (d) {
      s = l < .5 ? d / (max + min) : d / (2 - max - min);
      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    } else {
      h = NaN;
      s = l > 0 && l < 1 ? 0 : h;
    }
    return d3_hsl(h, s, l);
  }
  function d3_rgb_lab(r, g, b) {
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }
  function d3_rgb_xyz(r) {
    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
  }
  function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
  }
  var d3_rgb_names = d3.map({
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  });
  d3_rgb_names.forEach(function(key, value) {
    d3_rgb_names.set(key, d3_rgbNumber(value));
  });
  function d3_functor(v) {
    return typeof v === "function" ? v : function() {
      return v;
    };
  }
  d3.functor = d3_functor;
  function d3_identity(d) {
    return d;
  }
  d3.xhr = d3_xhrType(d3_identity);
  function d3_xhrType(response) {
    return function(url, mimeType, callback) {
      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
      mimeType = null;
      return d3_xhr(url, mimeType, response, callback);
    };
  }
  function d3_xhr(url, mimeType, response, callback) {
    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
    if (d3_window.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
      request.readyState > 3 && respond();
    };
    function respond() {
      var status = request.status, result;
      if (!status && request.responseText || status >= 200 && status < 300 || status === 304) {
        try {
          result = response.call(xhr, request);
        } catch (e) {
          dispatch.error.call(xhr, e);
          return;
        }
        dispatch.load.call(xhr, result);
      } else {
        dispatch.error.call(xhr, request);
      }
    }
    request.onprogress = function(event) {
      var o = d3.event;
      d3.event = event;
      try {
        dispatch.progress.call(xhr, request);
      } finally {
        d3.event = o;
      }
    };
    xhr.header = function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers[name];
      if (value == null) delete headers[name]; else headers[name] = value + "";
      return xhr;
    };
    xhr.mimeType = function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return xhr;
    };
    xhr.responseType = function(value) {
      if (!arguments.length) return responseType;
      responseType = value;
      return xhr;
    };
    xhr.response = function(value) {
      response = value;
      return xhr;
    };
    [ "get", "post" ].forEach(function(method) {
      xhr[method] = function() {
        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
      };
    });
    xhr.send = function(method, data, callback) {
      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
      request.open(method, url, true);
      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
      if (responseType != null) request.responseType = responseType;
      if (callback != null) xhr.on("error", callback).on("load", function(request) {
        callback(null, request);
      });
      dispatch.beforesend.call(xhr, request);
      request.send(data == null ? null : data);
      return xhr;
    };
    xhr.abort = function() {
      request.abort();
      return xhr;
    };
    d3.rebind(xhr, dispatch, "on");
    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
  }
  function d3_xhr_fixCallback(callback) {
    return callback.length === 1 ? function(error, request) {
      callback(error == null ? request : null);
    } : callback;
  }
  d3.dsv = function(delimiter, mimeType) {
    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
    function dsv(url, row, callback) {
      if (arguments.length < 3) callback = row, row = null;
      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
      xhr.row = function(_) {
        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
      };
      return xhr;
    }
    function response(request) {
      return dsv.parse(request.responseText);
    }
    function typedResponse(f) {
      return function(request) {
        return dsv.parse(request.responseText, f);
      };
    }
    dsv.parse = function(text, f) {
      var o;
      return dsv.parseRows(text, function(row, i) {
        if (o) return o(row, i - 1);
        var a = new Function("d", "return {" + row.map(function(name, i) {
          return JSON.stringify(name) + ": d[" + i + "]";
        }).join(",") + "}");
        o = f ? function(row, i) {
          return f(a(row), i);
        } : a;
      });
    };
    dsv.parseRows = function(text, f) {
      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
      function token() {
        if (I >= N) return EOF;
        if (eol) return eol = false, EOL;
        var j = I;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          var c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.substring(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
          var c = text.charCodeAt(I++), k = 1;
          if (c === 10) eol = true; else if (c === 13) {
            eol = true;
            if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
          return text.substring(j, I - k);
        }
        return text.substring(j);
      }
      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && !(a = f(a, n++))) continue;
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
      var fieldSet = new d3_Set(), fields = [];
      rows.forEach(function(row) {
        for (var field in row) {
          if (!fieldSet.has(field)) {
            fields.push(fieldSet.add(field));
          }
        }
      });
      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
        return fields.map(function(field) {
          return formatValue(row[field]);
        }).join(delimiter);
      })).join("\n");
    };
    dsv.formatRows = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }
    function formatValue(text) {
      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
    }
    return dsv;
  };
  d3.csv = d3.dsv(",", "text/csv");
  d3.tsv = d3.dsv("	", "text/tab-separated-values");
  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_active, d3_timer_frame = d3_window[d3_vendorSymbol(d3_window, "requestAnimationFrame")] || function(callback) {
    setTimeout(callback, 17);
  };
  d3.timer = function(callback, delay, then) {
    var n = arguments.length;
    if (n < 2) delay = 0;
    if (n < 3) then = Date.now();
    var time = then + delay, timer = {
      c: callback,
      t: time,
      f: false,
      n: null
    };
    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
    d3_timer_queueTail = timer;
    if (!d3_timer_interval) {
      d3_timer_timeout = clearTimeout(d3_timer_timeout);
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  };
  function d3_timer_step() {
    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
    if (delay > 24) {
      if (isFinite(delay)) {
        clearTimeout(d3_timer_timeout);
        d3_timer_timeout = setTimeout(d3_timer_step, delay);
      }
      d3_timer_interval = 0;
    } else {
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  }
  d3.timer.flush = function() {
    d3_timer_mark();
    d3_timer_sweep();
  };
  function d3_timer_mark() {
    var now = Date.now();
    d3_timer_active = d3_timer_queueHead;
    while (d3_timer_active) {
      if (now >= d3_timer_active.t) d3_timer_active.f = d3_timer_active.c(now - d3_timer_active.t);
      d3_timer_active = d3_timer_active.n;
    }
    return now;
  }
  function d3_timer_sweep() {
    var t0, t1 = d3_timer_queueHead, time = Infinity;
    while (t1) {
      if (t1.f) {
        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
      } else {
        if (t1.t < time) time = t1.t;
        t1 = (t0 = t1).n;
      }
    }
    d3_timer_queueTail = t0;
    return time;
  }
  function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
  d3.round = function(x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
  };
  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
  d3.formatPrefix = function(value, precision) {
    var i = 0;
    if (value) {
      if (value < 0) value *= -1;
      if (precision) value = d3.round(value, d3_format_precision(value, precision));
      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
      i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
    }
    return d3_formatPrefixes[8 + i / 3];
  };
  function d3_formatPrefix(d, i) {
    var k = Math.pow(10, abs(8 - i) * 3);
    return {
      scale: i > 8 ? function(d) {
        return d / k;
      } : function(d) {
        return d * k;
      },
      symbol: d
    };
  }
  function d3_locale_numberFormat(locale) {
    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping ? function(value) {
      var i = value.length, t = [], j = 0, g = locale_grouping[0];
      while (i > 0 && g > 0) {
        t.push(value.substring(i -= g, i + g));
        g = locale_grouping[j = (j + 1) % locale_grouping.length];
      }
      return t.reverse().join(locale_thousands);
    } : d3_identity;
    return function(specifier) {
      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false;
      if (precision) precision = +precision.substring(1);
      if (zfill || fill === "0" && align === "=") {
        zfill = fill = "0";
        align = "=";
        if (comma) width -= Math.floor((width - 1) / 4);
      }
      switch (type) {
       case "n":
        comma = true;
        type = "g";
        break;

       case "%":
        scale = 100;
        suffix = "%";
        type = "f";
        break;

       case "p":
        scale = 100;
        suffix = "%";
        type = "r";
        break;

       case "b":
       case "o":
       case "x":
       case "X":
        if (symbol === "#") prefix = "0" + type.toLowerCase();

       case "c":
       case "d":
        integer = true;
        precision = 0;
        break;

       case "s":
        scale = -1;
        type = "r";
        break;
      }
      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
      if (type == "r" && !precision) type = "g";
      if (precision != null) {
        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
      }
      type = d3_format_types.get(type) || d3_format_typeDefault;
      var zcomma = zfill && comma;
      return function(value) {
        var fullSuffix = suffix;
        if (integer && value % 1) return "";
        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;
        if (scale < 0) {
          var unit = d3.formatPrefix(value, precision);
          value = unit.scale(value);
          fullSuffix = unit.symbol + suffix;
        } else {
          value *= scale;
        }
        value = type(value, precision);
        var i = value.lastIndexOf("."), before = i < 0 ? value : value.substring(0, i), after = i < 0 ? "" : locale_decimal + value.substring(i + 1);
        if (!zfill && comma) before = formatGroup(before);
        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
        if (zcomma) before = formatGroup(padding + before);
        negative += prefix;
        value = before + after;
        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
      };
    };
  }
  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
  var d3_format_types = d3.map({
    b: function(x) {
      return x.toString(2);
    },
    c: function(x) {
      return String.fromCharCode(x);
    },
    o: function(x) {
      return x.toString(8);
    },
    x: function(x) {
      return x.toString(16);
    },
    X: function(x) {
      return x.toString(16).toUpperCase();
    },
    g: function(x, p) {
      return x.toPrecision(p);
    },
    e: function(x, p) {
      return x.toExponential(p);
    },
    f: function(x, p) {
      return x.toFixed(p);
    },
    r: function(x, p) {
      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
    }
  });
  function d3_format_typeDefault(x) {
    return x + "";
  }
  var d3_time = d3.time = {}, d3_date = Date;
  function d3_date_utc() {
    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
  }
  d3_date_utc.prototype = {
    getDate: function() {
      return this._.getUTCDate();
    },
    getDay: function() {
      return this._.getUTCDay();
    },
    getFullYear: function() {
      return this._.getUTCFullYear();
    },
    getHours: function() {
      return this._.getUTCHours();
    },
    getMilliseconds: function() {
      return this._.getUTCMilliseconds();
    },
    getMinutes: function() {
      return this._.getUTCMinutes();
    },
    getMonth: function() {
      return this._.getUTCMonth();
    },
    getSeconds: function() {
      return this._.getUTCSeconds();
    },
    getTime: function() {
      return this._.getTime();
    },
    getTimezoneOffset: function() {
      return 0;
    },
    valueOf: function() {
      return this._.valueOf();
    },
    setDate: function() {
      d3_time_prototype.setUTCDate.apply(this._, arguments);
    },
    setDay: function() {
      d3_time_prototype.setUTCDay.apply(this._, arguments);
    },
    setFullYear: function() {
      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
    },
    setHours: function() {
      d3_time_prototype.setUTCHours.apply(this._, arguments);
    },
    setMilliseconds: function() {
      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
    },
    setMinutes: function() {
      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
    },
    setMonth: function() {
      d3_time_prototype.setUTCMonth.apply(this._, arguments);
    },
    setSeconds: function() {
      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
    },
    setTime: function() {
      d3_time_prototype.setTime.apply(this._, arguments);
    }
  };
  var d3_time_prototype = Date.prototype;
  function d3_time_interval(local, step, number) {
    function round(date) {
      var d0 = local(date), d1 = offset(d0, 1);
      return date - d0 < d1 - date ? d0 : d1;
    }
    function ceil(date) {
      step(date = local(new d3_date(date - 1)), 1);
      return date;
    }
    function offset(date, k) {
      step(date = new d3_date(+date), k);
      return date;
    }
    function range(t0, t1, dt) {
      var time = ceil(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          if (!(number(time) % dt)) times.push(new Date(+time));
          step(time, 1);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time, 1);
      }
      return times;
    }
    function range_utc(t0, t1, dt) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = t0;
        return range(utc, t1, dt);
      } finally {
        d3_date = Date;
      }
    }
    local.floor = local;
    local.round = round;
    local.ceil = ceil;
    local.offset = offset;
    local.range = range;
    var utc = local.utc = d3_time_interval_utc(local);
    utc.floor = utc;
    utc.round = d3_time_interval_utc(round);
    utc.ceil = d3_time_interval_utc(ceil);
    utc.offset = d3_time_interval_utc(offset);
    utc.range = range_utc;
    return local;
  }
  function d3_time_interval_utc(method) {
    return function(date, k) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = date;
        return method(utc, k)._;
      } finally {
        d3_date = Date;
      }
    };
  }
  d3_time.year = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setMonth(0, 1);
    return date;
  }, function(date, offset) {
    date.setFullYear(date.getFullYear() + offset);
  }, function(date) {
    return date.getFullYear();
  });
  d3_time.years = d3_time.year.range;
  d3_time.years.utc = d3_time.year.utc.range;
  d3_time.day = d3_time_interval(function(date) {
    var day = new d3_date(2e3, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
  }, function(date, offset) {
    date.setDate(date.getDate() + offset);
  }, function(date) {
    return date.getDate() - 1;
  });
  d3_time.days = d3_time.day.range;
  d3_time.days.utc = d3_time.day.utc.range;
  d3_time.dayOfYear = function(date) {
    var year = d3_time.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
  };
  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
    i = 7 - i;
    var interval = d3_time[day] = d3_time_interval(function(date) {
      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
      return date;
    }, function(date, offset) {
      date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
    });
    d3_time[day + "s"] = interval.range;
    d3_time[day + "s"].utc = interval.utc.range;
    d3_time[day + "OfYear"] = function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
    };
  });
  d3_time.week = d3_time.sunday;
  d3_time.weeks = d3_time.sunday.range;
  d3_time.weeks.utc = d3_time.sunday.utc.range;
  d3_time.weekOfYear = d3_time.sundayOfYear;
  function d3_locale_timeFormat(locale) {
    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
    function d3_time_format(template) {
      var n = template.length;
      function format(date) {
        var string = [], i = -1, j = 0, c, p, f;
        while (++i < n) {
          if (template.charCodeAt(i) === 37) {
            string.push(template.substring(j, i));
            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(template.substring(j, i));
        return string.join("");
      }
      format.parse = function(string) {
        var d = {
          y: 1900,
          m: 0,
          d: 1,
          H: 0,
          M: 0,
          S: 0,
          L: 0,
          Z: null
        }, i = d3_time_parse(d, template, string, 0);
        if (i != string.length) return null;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("w" in d && ("W" in d || "U" in d)) {
          date.setFullYear(d.y, 0, 1);
          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
        } else date.setFullYear(d.y, d.m, d.d);
        date.setHours(d.H + Math.floor(d.Z / 100), d.M + d.Z % 100, d.S, d.L);
        return localZ ? date._ : date;
      };
      format.toString = function() {
        return template;
      };
      return format;
    }
    function d3_time_parse(date, template, string, j) {
      var c, p, t, i = 0, n = template.length, m = string.length;
      while (i < n) {
        if (j >= m) return -1;
        c = template.charCodeAt(i++);
        if (c === 37) {
          t = template.charAt(i++);
          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
          if (!p || (j = p(date, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    d3_time_format.utc = function(template) {
      var local = d3_time_format(template);
      function format(date) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date();
          utc._ = date;
          return local(utc);
        } finally {
          d3_date = Date;
        }
      }
      format.parse = function(string) {
        try {
          d3_date = d3_date_utc;
          var date = local.parse(string);
          return date && date._;
        } finally {
          d3_date = Date;
        }
      };
      format.toString = local.toString;
      return format;
    };
    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
    locale_periods.forEach(function(p, i) {
      d3_time_periodLookup.set(p.toLowerCase(), i);
    });
    var d3_time_formats = {
      a: function(d) {
        return locale_shortDays[d.getDay()];
      },
      A: function(d) {
        return locale_days[d.getDay()];
      },
      b: function(d) {
        return locale_shortMonths[d.getMonth()];
      },
      B: function(d) {
        return locale_months[d.getMonth()];
      },
      c: d3_time_format(locale_dateTime),
      d: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      e: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      H: function(d, p) {
        return d3_time_formatPad(d.getHours(), p, 2);
      },
      I: function(d, p) {
        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
      },
      j: function(d, p) {
        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
      },
      L: function(d, p) {
        return d3_time_formatPad(d.getMilliseconds(), p, 3);
      },
      m: function(d, p) {
        return d3_time_formatPad(d.getMonth() + 1, p, 2);
      },
      M: function(d, p) {
        return d3_time_formatPad(d.getMinutes(), p, 2);
      },
      p: function(d) {
        return locale_periods[+(d.getHours() >= 12)];
      },
      S: function(d, p) {
        return d3_time_formatPad(d.getSeconds(), p, 2);
      },
      U: function(d, p) {
        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
      },
      w: function(d) {
        return d.getDay();
      },
      W: function(d, p) {
        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
      },
      x: d3_time_format(locale_date),
      X: d3_time_format(locale_time),
      y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
      },
      Y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
      },
      Z: d3_time_zone,
      "%": function() {
        return "%";
      }
    };
    var d3_time_parsers = {
      a: d3_time_parseWeekdayAbbrev,
      A: d3_time_parseWeekday,
      b: d3_time_parseMonthAbbrev,
      B: d3_time_parseMonth,
      c: d3_time_parseLocaleFull,
      d: d3_time_parseDay,
      e: d3_time_parseDay,
      H: d3_time_parseHour24,
      I: d3_time_parseHour24,
      j: d3_time_parseDayOfYear,
      L: d3_time_parseMilliseconds,
      m: d3_time_parseMonthNumber,
      M: d3_time_parseMinutes,
      p: d3_time_parseAmPm,
      S: d3_time_parseSeconds,
      U: d3_time_parseWeekNumberSunday,
      w: d3_time_parseWeekdayNumber,
      W: d3_time_parseWeekNumberMonday,
      x: d3_time_parseLocaleDate,
      X: d3_time_parseLocaleTime,
      y: d3_time_parseYear,
      Y: d3_time_parseFullYear,
      Z: d3_time_parseZone,
      "%": d3_time_parseLiteralPercent
    };
    function d3_time_parseWeekdayAbbrev(date, string, i) {
      d3_time_dayAbbrevRe.lastIndex = 0;
      var n = d3_time_dayAbbrevRe.exec(string.substring(i));
      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekday(date, string, i) {
      d3_time_dayRe.lastIndex = 0;
      var n = d3_time_dayRe.exec(string.substring(i));
      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonthAbbrev(date, string, i) {
      d3_time_monthAbbrevRe.lastIndex = 0;
      var n = d3_time_monthAbbrevRe.exec(string.substring(i));
      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonth(date, string, i) {
      d3_time_monthRe.lastIndex = 0;
      var n = d3_time_monthRe.exec(string.substring(i));
      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseLocaleFull(date, string, i) {
      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
    }
    function d3_time_parseLocaleDate(date, string, i) {
      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
    }
    function d3_time_parseLocaleTime(date, string, i) {
      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
    }
    function d3_time_parseAmPm(date, string, i) {
      var n = d3_time_periodLookup.get(string.substring(i, i += 2).toLowerCase());
      return n == null ? -1 : (date.p = n, i);
    }
    return d3_time_format;
  }
  var d3_time_formatPads = {
    "-": "",
    _: " ",
    "0": "0"
  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
  function d3_time_formatPad(value, fill, width) {
    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function d3_time_formatRe(names) {
    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
  }
  function d3_time_formatLookup(names) {
    var map = new d3_Map(), i = -1, n = names.length;
    while (++i < n) map.set(names[i].toLowerCase(), i);
    return map;
  }
  function d3_time_parseWeekdayNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 1));
    return n ? (date.w = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberSunday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i));
    return n ? (date.U = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberMonday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i));
    return n ? (date.W = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseFullYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 4));
    return n ? (date.y = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
  }
  function d3_time_parseZone(date, string, i) {
    return /^[+-]\d{4}$/.test(string = string.substring(i, i + 5)) ? (date.Z = +string, 
    i + 5) : -1;
  }
  function d3_time_expandYear(d) {
    return d + (d > 68 ? 1900 : 2e3);
  }
  function d3_time_parseMonthNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
  }
  function d3_time_parseDay(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.d = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseDayOfYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 3));
    return n ? (date.j = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseHour24(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.H = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMinutes(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.M = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseSeconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.S = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMilliseconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 3));
    return n ? (date.L = +n[0], i + n[0].length) : -1;
  }
  function d3_time_zone(d) {
    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = ~~(abs(z) / 60), zm = abs(z) % 60;
    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
  }
  function d3_time_parseLiteralPercent(date, string, i) {
    d3_time_percentRe.lastIndex = 0;
    var n = d3_time_percentRe.exec(string.substring(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function d3_time_formatMulti(formats) {
    var n = formats.length, i = -1;
    while (++i < n) formats[i][0] = this(formats[i][0]);
    return function(date) {
      var i = 0, f = formats[i];
      while (!f[1](date)) f = formats[++i];
      return f[0](date);
    };
  }
  d3.locale = function(locale) {
    return {
      numberFormat: d3_locale_numberFormat(locale),
      timeFormat: d3_locale_timeFormat(locale)
    };
  };
  var d3_locale_enUS = d3.locale({
    decimal: ".",
    thousands: ",",
    grouping: [ 3 ],
    currency: [ "$", "" ],
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: [ "AM", "PM" ],
    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  });
  d3.format = d3_locale_enUS.numberFormat;
  d3.geo = {};
  function d3_adder() {}
  d3_adder.prototype = {
    s: 0,
    t: 0,
    add: function(y) {
      d3_adderSum(y, this.t, d3_adderTemp);
      d3_adderSum(d3_adderTemp.s, this.s, this);
      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
    },
    reset: function() {
      this.s = this.t = 0;
    },
    valueOf: function() {
      return this.s;
    }
  };
  var d3_adderTemp = new d3_adder();
  function d3_adderSum(a, b, o) {
    var x = o.s = a + b, bv = x - a, av = x - bv;
    o.t = a - av + (b - bv);
  }
  d3.geo.stream = function(object, listener) {
    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
      d3_geo_streamObjectType[object.type](object, listener);
    } else {
      d3_geo_streamGeometry(object, listener);
    }
  };
  function d3_geo_streamGeometry(geometry, listener) {
    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
      d3_geo_streamGeometryType[geometry.type](geometry, listener);
    }
  }
  var d3_geo_streamObjectType = {
    Feature: function(feature, listener) {
      d3_geo_streamGeometry(feature.geometry, listener);
    },
    FeatureCollection: function(object, listener) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
    }
  };
  var d3_geo_streamGeometryType = {
    Sphere: function(object, listener) {
      listener.sphere();
    },
    Point: function(object, listener) {
      object = object.coordinates;
      listener.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
    },
    LineString: function(object, listener) {
      d3_geo_streamLine(object.coordinates, listener, 0);
    },
    MultiLineString: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
    },
    Polygon: function(object, listener) {
      d3_geo_streamPolygon(object.coordinates, listener);
    },
    MultiPolygon: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
    },
    GeometryCollection: function(object, listener) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
    }
  };
  function d3_geo_streamLine(coordinates, listener, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    listener.lineStart();
    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
    listener.lineEnd();
  }
  function d3_geo_streamPolygon(coordinates, listener) {
    var i = -1, n = coordinates.length;
    listener.polygonStart();
    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
    listener.polygonEnd();
  }
  d3.geo.area = function(object) {
    d3_geo_areaSum = 0;
    d3.geo.stream(object, d3_geo_area);
    return d3_geo_areaSum;
  };
  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
  var d3_geo_area = {
    sphere: function() {
      d3_geo_areaSum += 4 * π;
    },
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_areaRingSum.reset();
      d3_geo_area.lineStart = d3_geo_areaRingStart;
    },
    polygonEnd: function() {
      var area = 2 * d3_geo_areaRingSum;
      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
    }
  };
  function d3_geo_areaRingStart() {
    var λ00, φ00, λ0, cosφ0, sinφ0;
    d3_geo_area.point = function(λ, φ) {
      d3_geo_area.point = nextPoint;
      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
      sinφ0 = Math.sin(φ);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      φ = φ * d3_radians / 2 + π / 4;
      var dλ = λ - λ0, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(dλ), v = k * Math.sin(dλ);
      d3_geo_areaRingSum.add(Math.atan2(v, u));
      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
    }
    d3_geo_area.lineEnd = function() {
      nextPoint(λ00, φ00);
    };
  }
  function d3_geo_cartesian(spherical) {
    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
  }
  function d3_geo_cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function d3_geo_cartesianCross(a, b) {
    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
  }
  function d3_geo_cartesianAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
  }
  function d3_geo_cartesianScale(vector, k) {
    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
  }
  function d3_geo_cartesianNormalize(d) {
    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l;
    d[1] /= l;
    d[2] /= l;
  }
  function d3_geo_spherical(cartesian) {
    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
  }
  function d3_geo_sphericalEqual(a, b) {
    return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
  }
  d3.geo.bounds = function() {
    var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
    var bound = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        bound.point = ringPoint;
        bound.lineStart = ringStart;
        bound.lineEnd = ringEnd;
        dλSum = 0;
        d3_geo_area.polygonStart();
      },
      polygonEnd: function() {
        d3_geo_area.polygonEnd();
        bound.point = point;
        bound.lineStart = lineStart;
        bound.lineEnd = lineEnd;
        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
        range[0] = λ0, range[1] = λ1;
      }
    };
    function point(λ, φ) {
      ranges.push(range = [ λ0 = λ, λ1 = λ ]);
      if (φ < φ0) φ0 = φ;
      if (φ > φ1) φ1 = φ;
    }
    function linePoint(λ, φ) {
      var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
      if (p0) {
        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
        d3_geo_cartesianNormalize(inflection);
        inflection = d3_geo_spherical(inflection);
        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
          var φi = inflection[1] * d3_degrees;
          if (φi > φ1) φ1 = φi;
        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
          var φi = -inflection[1] * d3_degrees;
          if (φi < φ0) φ0 = φi;
        } else {
          if (φ < φ0) φ0 = φ;
          if (φ > φ1) φ1 = φ;
        }
        if (antimeridian) {
          if (λ < λ_) {
            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
          } else {
            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
          }
        } else {
          if (λ1 >= λ0) {
            if (λ < λ0) λ0 = λ;
            if (λ > λ1) λ1 = λ;
          } else {
            if (λ > λ_) {
              if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
            } else {
              if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
            }
          }
        }
      } else {
        point(λ, φ);
      }
      p0 = p, λ_ = λ;
    }
    function lineStart() {
      bound.point = linePoint;
    }
    function lineEnd() {
      range[0] = λ0, range[1] = λ1;
      bound.point = point;
      p0 = null;
    }
    function ringPoint(λ, φ) {
      if (p0) {
        var dλ = λ - λ_;
        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
      } else λ__ = λ, φ__ = φ;
      d3_geo_area.point(λ, φ);
      linePoint(λ, φ);
    }
    function ringStart() {
      d3_geo_area.lineStart();
    }
    function ringEnd() {
      ringPoint(λ__, φ__);
      d3_geo_area.lineEnd();
      if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
      range[0] = λ0, range[1] = λ1;
      p0 = null;
    }
    function angle(λ0, λ1) {
      return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
    }
    function compareRanges(a, b) {
      return a[0] - b[0];
    }
    function withinRange(x, range) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }
    return function(feature) {
      φ1 = λ1 = -(λ0 = φ0 = Infinity);
      ranges = [];
      d3.geo.stream(feature, bound);
      var n = ranges.length;
      if (n) {
        ranges.sort(compareRanges);
        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
          b = ranges[i];
          if (withinRange(b[0], a) || withinRange(b[1], a)) {
            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }
        var best = -Infinity, dλ;
        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
          b = merged[i];
          if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
        }
      }
      ranges = range = null;
      return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
    };
  }();
  d3.geo.centroid = function(object) {
    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
    d3.geo.stream(object, d3_geo_centroid);
    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
    if (m < ε2) {
      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
      if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
      m = x * x + y * y + z * z;
      if (m < ε2) return [ NaN, NaN ];
    }
    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
  };
  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
  var d3_geo_centroid = {
    sphere: d3_noop,
    point: d3_geo_centroidPoint,
    lineStart: d3_geo_centroidLineStart,
    lineEnd: d3_geo_centroidLineEnd,
    polygonStart: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
    }
  };
  function d3_geo_centroidPoint(λ, φ) {
    λ *= d3_radians;
    var cosφ = Math.cos(φ *= d3_radians);
    d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
  }
  function d3_geo_centroidPointXYZ(x, y, z) {
    ++d3_geo_centroidW0;
    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
  }
  function d3_geo_centroidLineStart() {
    var x0, y0, z0;
    d3_geo_centroid.point = function(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroid.point = nextPoint;
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_centroidLineEnd() {
    d3_geo_centroid.point = d3_geo_centroidPoint;
  }
  function d3_geo_centroidRingStart() {
    var λ00, φ00, x0, y0, z0;
    d3_geo_centroid.point = function(λ, φ) {
      λ00 = λ, φ00 = φ;
      d3_geo_centroid.point = nextPoint;
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    d3_geo_centroid.lineEnd = function() {
      nextPoint(λ00, φ00);
      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
      d3_geo_centroid.point = d3_geo_centroidPoint;
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
      d3_geo_centroidX2 += v * cx;
      d3_geo_centroidY2 += v * cy;
      d3_geo_centroidZ2 += v * cz;
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_true() {
    return true;
  }
  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
    var subject = [], clip = [];
    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n];
      if (d3_geo_sphericalEqual(p0, p1)) {
        listener.lineStart();
        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
        listener.lineEnd();
        return;
      }
      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
      a.o = b;
      subject.push(a);
      clip.push(b);
      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
      a.o = b;
      subject.push(a);
      clip.push(b);
    });
    clip.sort(compare);
    d3_geo_clipPolygonLinkCircular(subject);
    d3_geo_clipPolygonLinkCircular(clip);
    if (!subject.length) return;
    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
      clip[i].e = entry = !entry;
    }
    var start = subject[0], points, point;
    while (1) {
      var current = start, isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      listener.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, listener);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, listener);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      listener.lineEnd();
    }
  }
  function d3_geo_clipPolygonLinkCircular(array) {
    if (!(n = array.length)) return;
    var n, i = 0, a = array[0], b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }
  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
    return function(rotate, listener) {
      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
          listener.polygonStart();
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = d3.merge(segments);
          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
          if (segments.length) {
            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
          } else if (clipStartInside) {
            listener.lineStart();
            interpolate(null, null, 1, listener);
            listener.lineEnd();
          }
          listener.polygonEnd();
          segments = polygon = null;
        },
        sphere: function() {
          listener.polygonStart();
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
          listener.polygonEnd();
        }
      };
      function point(λ, φ) {
        var point = rotate(λ, φ);
        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
      }
      function pointLine(λ, φ) {
        var point = rotate(λ, φ);
        line.point(point[0], point[1]);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      var segments;
      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygon, ring;
      function pointRing(λ, φ) {
        ring.push([ λ, φ ]);
        var point = rotate(λ, φ);
        ringListener.point(point[0], point[1]);
      }
      function ringStart() {
        ringListener.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringListener.lineEnd();
        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          var n = segment.length - 1, i = -1, point;
          listener.lineStart();
          while (++i < n) listener.point((point = segment[i])[0], point[1]);
          listener.lineEnd();
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
      }
      return clip;
    };
  }
  function d3_geo_clipSegmentLength1(segment) {
    return segment.length > 1;
  }
  function d3_geo_clipBufferListener() {
    var lines = [], line;
    return {
      lineStart: function() {
        lines.push(line = []);
      },
      point: function(λ, φ) {
        line.push([ λ, φ ]);
      },
      lineEnd: d3_noop,
      buffer: function() {
        var buffer = lines;
        lines = [];
        line = null;
        return buffer;
      },
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      }
    };
  }
  function d3_geo_clipSort(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
  }
  function d3_geo_pointInPolygon(point, polygon) {
    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
    d3_geo_areaRingSum.reset();
    for (var i = 0, n = polygon.length; i < n; ++i) {
      var ring = polygon[i], m = ring.length;
      if (!m) continue;
      var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
      while (true) {
        if (j === m) j = 0;
        point = ring[j];
        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, antimeridian = abs(dλ) > π, k = sinφ0 * sinφ;
        d3_geo_areaRingSum.add(Math.atan2(k * Math.sin(dλ), cosφ0 * cosφ + k * Math.cos(dλ)));
        polarAngle += antimeridian ? dλ + (dλ >= 0 ? τ : -τ) : dλ;
        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
          d3_geo_cartesianNormalize(arc);
          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
          d3_geo_cartesianNormalize(intersection);
          var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
          if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
          }
        }
        if (!j++) break;
        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
      }
    }
    return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
  }
  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
  function d3_geo_clipAntimeridianLine(listener) {
    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
    return {
      lineStart: function() {
        listener.lineStart();
        clean = 1;
      },
      point: function(λ1, φ1) {
        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
        if (abs(dλ - π) < ε) {
          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          listener.point(λ1, φ0);
          clean = 0;
        } else if (sλ0 !== sλ1 && dλ >= π) {
          if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
          if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          clean = 0;
        }
        listener.point(λ0 = λ1, φ0 = φ1);
        sλ0 = sλ1;
      },
      lineEnd: function() {
        listener.lineEnd();
        λ0 = φ0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
    return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
  }
  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
    var φ;
    if (from == null) {
      φ = direction * halfπ;
      listener.point(-π, φ);
      listener.point(0, φ);
      listener.point(π, φ);
      listener.point(π, 0);
      listener.point(π, -φ);
      listener.point(0, -φ);
      listener.point(-π, -φ);
      listener.point(-π, 0);
      listener.point(-π, φ);
    } else if (abs(from[0] - to[0]) > ε) {
      var s = from[0] < to[0] ? π : -π;
      φ = direction * s / 2;
      listener.point(-s, φ);
      listener.point(0, φ);
      listener.point(s, φ);
    } else {
      listener.point(to[0], to[1]);
    }
  }
  function d3_geo_clipCircle(radius) {
    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
    function visible(λ, φ) {
      return Math.cos(λ) * Math.cos(φ) > cr;
    }
    function clipLine(listener) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(λ, φ) {
          var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
          if (!point0 && (v00 = v0 = v)) listener.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
              point1[0] += ε;
              point1[1] += ε;
              v = visible(point1[0], point1[1]);
            }
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              listener.lineStart();
              point2 = intersect(point1, point0);
              listener.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              listener.point(point2[0], point2[1]);
              listener.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
              } else {
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
              }
            }
          }
          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
            listener.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) listener.lineEnd();
          point0 = null;
        },
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
      d3_geo_cartesianAdd(A, B);
      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
      d3_geo_cartesianAdd(q, A);
      q = d3_geo_spherical(q);
      if (!two) return q;
      var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
      if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
      var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
      if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
      if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
        d3_geo_cartesianAdd(q1, A);
        return [ q, d3_geo_spherical(q1) ];
      }
    }
    function code(λ, φ) {
      var r = smallRadius ? radius : π - radius, code = 0;
      if (λ < -r) code |= 1; else if (λ > r) code |= 2;
      if (φ < -r) code |= 4; else if (φ > r) code |= 8;
      return code;
    }
  }
  function d3_geom_clipLine(x0, y0, x1, y1) {
    return function(line) {
      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      if (t0 > 0) line.a = {
        x: ax + t0 * dx,
        y: ay + t0 * dy
      };
      if (t1 < 1) line.b = {
        x: ax + t1 * dx,
        y: ay + t1 * dy
      };
      return line;
    };
  }
  var d3_geo_clipExtentMAX = 1e9;
  d3.geo.clipExtent = function() {
    var x0, y0, x1, y1, stream, clip, clipExtent = {
      stream: function(output) {
        if (stream) stream.valid = false;
        stream = clip(output);
        stream.valid = true;
        return stream;
      },
      extent: function(_) {
        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
        if (stream) stream.valid = false, stream = null;
        return clipExtent;
      }
    };
    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
  };
  function d3_geo_clipExtent(x0, y0, x1, y1) {
    return function(listener) {
      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          listener = bufferListener;
          segments = [];
          polygon = [];
          clean = true;
        },
        polygonEnd: function() {
          listener = listener_;
          segments = d3.merge(segments);
          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
          if (inside || visible) {
            listener.polygonStart();
            if (inside) {
              listener.lineStart();
              interpolate(null, null, 1, listener);
              listener.lineEnd();
            }
            if (visible) {
              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
            }
            listener.polygonEnd();
          }
          segments = polygon = ring = null;
        }
      };
      function insidePolygon(p) {
        var wn = 0, n = polygon.length, y = p[1];
        for (var i = 0; i < n; ++i) {
          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
            b = v[j];
            if (a[1] <= y) {
              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
            } else {
              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
            }
            a = b;
          }
        }
        return wn !== 0;
      }
      function interpolate(from, to, direction, listener) {
        var a = 0, a1 = 0;
        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
          do {
            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          } while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          listener.point(to[0], to[1]);
        }
      }
      function pointVisible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }
      function point(x, y) {
        if (pointVisible(x, y)) listener.point(x, y);
      }
      var x__, y__, v__, x_, y_, v_, first, clean;
      function lineStart() {
        clip.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferListener.rejoin();
          segments.push(bufferListener.buffer());
        }
        clip.point = point;
        if (v_) listener.lineEnd();
      }
      function linePoint(x, y) {
        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
        var v = pointVisible(x, y);
        if (polygon) ring.push([ x, y ]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            listener.lineStart();
            listener.point(x, y);
          }
        } else {
          if (v && v_) listener.point(x, y); else {
            var l = {
              a: {
                x: x_,
                y: y_
              },
              b: {
                x: x,
                y: y
              }
            };
            if (clipLine(l)) {
              if (!v_) {
                listener.lineStart();
                listener.point(l.a.x, l.a.y);
              }
              listener.point(l.b.x, l.b.y);
              if (!v) listener.lineEnd();
              clean = false;
            } else if (v) {
              listener.lineStart();
              listener.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clip;
    };
    function corner(p, direction) {
      return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compare(a, b) {
      return comparePoints(a.x, b.x);
    }
    function comparePoints(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
  }
  function d3_geo_compose(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }
  function d3_geo_conic(projectAt) {
    var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
    p.parallels = function(_) {
      if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
      return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
    };
    return p;
  }
  function d3_geo_conicEqualArea(φ0, φ1) {
    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
    function forward(λ, φ) {
      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = ρ0 - y;
      return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
    };
    return forward;
  }
  (d3.geo.conicEqualArea = function() {
    return d3_geo_conic(d3_geo_conicEqualArea);
  }).raw = d3_geo_conicEqualArea;
  d3.geo.albers = function() {
    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
  };
  d3.geo.albersUsa = function() {
    var lower48 = d3.geo.albers();
    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
    var point, pointStream = {
      point: function(x, y) {
        point = [ x, y ];
      }
    }, lower48Point, alaskaPoint, hawaiiPoint;
    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
      return point;
    }
    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
    };
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
        }
      };
    };
    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      return albersUsa;
    };
    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];
      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
      return albersUsa;
    };
    return albersUsa.scale(1070);
  };
  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathAreaPolygon = 0;
      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
    }
  };
  function d3_geo_pathAreaRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathArea.point = function(x, y) {
      d3_geo_pathArea.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
      x0 = x, y0 = y;
    }
    d3_geo_pathArea.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
  var d3_geo_pathBounds = {
    point: d3_geo_pathBoundsPoint,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_pathBoundsPoint(x, y) {
    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
  }
  function d3_geo_pathBuffer() {
    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointCircle = d3_geo_pathBufferCircle(_);
        return stream;
      },
      result: function() {
        if (buffer.length) {
          var result = buffer.join("");
          buffer = [];
          return result;
        }
      }
    };
    function point(x, y) {
      buffer.push("M", x, ",", y, pointCircle);
    }
    function pointLineStart(x, y) {
      buffer.push("M", x, ",", y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      buffer.push("L", x, ",", y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      buffer.push("Z");
    }
    return stream;
  }
  function d3_geo_pathBufferCircle(radius) {
    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
  }
  var d3_geo_pathCentroid = {
    point: d3_geo_pathCentroidPoint,
    lineStart: d3_geo_pathCentroidLineStart,
    lineEnd: d3_geo_pathCentroidLineEnd,
    polygonStart: function() {
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
    }
  };
  function d3_geo_pathCentroidPoint(x, y) {
    d3_geo_centroidX0 += x;
    d3_geo_centroidY0 += y;
    ++d3_geo_centroidZ0;
  }
  function d3_geo_pathCentroidLineStart() {
    var x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
  }
  function d3_geo_pathCentroidLineEnd() {
    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
  }
  function d3_geo_pathCentroidRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      z = y0 * x - x0 * y;
      d3_geo_centroidX2 += z * (x0 + x);
      d3_geo_centroidY2 += z * (y0 + y);
      d3_geo_centroidZ2 += z * 3;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
    d3_geo_pathCentroid.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  function d3_geo_pathContext(context) {
    var pointRadius = 4.5;
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointRadius = _;
        return stream;
      },
      result: d3_noop
    };
    function point(x, y) {
      context.moveTo(x, y);
      context.arc(x, y, pointRadius, 0, τ);
    }
    function pointLineStart(x, y) {
      context.moveTo(x, y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      context.lineTo(x, y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      context.closePath();
    }
    return stream;
  }
  function d3_geo_resample(project) {
    var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
    function resample(stream) {
      return (maxDepth ? resampleRecursive : resampleNone)(stream);
    }
    function resampleNone(stream) {
      return d3_geo_transformPoint(stream, function(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      });
    }
    function resampleRecursive(stream) {
      var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
      var resample = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resample.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resample.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x0 = NaN;
        resample.point = linePoint;
        stream.lineStart();
      }
      function linePoint(λ, φ) {
        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }
      function lineEnd() {
        resample.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resample.point = ringPoint;
        resample.lineEnd = ringEnd;
      }
      function ringPoint(λ, φ) {
        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resample.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
        resample.lineEnd = lineEnd;
        lineEnd();
      }
      return resample;
    }
    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
      if (d2 > 4 * δ2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
        }
      }
    }
    resample.precision = function(_) {
      if (!arguments.length) return Math.sqrt(δ2);
      maxDepth = (δ2 = _ * _) > 0 && 16;
      return resample;
    };
    return resample;
  }
  d3.geo.path = function() {
    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
        d3.geo.stream(object, cacheStream);
      }
      return contextStream.result();
    }
    path.area = function(object) {
      d3_geo_pathAreaSum = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathArea));
      return d3_geo_pathAreaSum;
    };
    path.centroid = function(object) {
      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
    };
    path.bounds = function(object) {
      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
    };
    path.projection = function(_) {
      if (!arguments.length) return projection;
      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
      return reset();
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return reset();
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };
    function reset() {
      cacheStream = null;
      return path;
    }
    return path.projection(d3.geo.albersUsa()).context(null);
  };
  function d3_geo_pathProjectStream(project) {
    var resample = d3_geo_resample(function(x, y) {
      return project([ x * d3_degrees, y * d3_degrees ]);
    });
    return function(stream) {
      return d3_geo_projectionRadians(resample(stream));
    };
  }
  d3.geo.transform = function(methods) {
    return {
      stream: function(stream) {
        var transform = new d3_geo_transform(stream);
        for (var k in methods) transform[k] = methods[k];
        return transform;
      }
    };
  };
  function d3_geo_transform(stream) {
    this.stream = stream;
  }
  d3_geo_transform.prototype = {
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };
  function d3_geo_transformPoint(stream, point) {
    return {
      point: point,
      sphere: function() {
        stream.sphere();
      },
      lineStart: function() {
        stream.lineStart();
      },
      lineEnd: function() {
        stream.lineEnd();
      },
      polygonStart: function() {
        stream.polygonStart();
      },
      polygonEnd: function() {
        stream.polygonEnd();
      }
    };
  }
  d3.geo.projection = d3_geo_projection;
  d3.geo.projectionMutator = d3_geo_projectionMutator;
  function d3_geo_projection(project) {
    return d3_geo_projectionMutator(function() {
      return project;
    })();
  }
  function d3_geo_projectionMutator(projectAt) {
    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
      x = project(x, y);
      return [ x[0] * k + δx, δy - x[1] * k ];
    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
    function projection(point) {
      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
      return [ point[0] * k + δx, δy - point[1] * k ];
    }
    function invert(point) {
      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
    }
    projection.stream = function(output) {
      if (stream) stream.valid = false;
      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
      stream.valid = true;
      return stream;
    };
    projection.clipAngle = function(_) {
      if (!arguments.length) return clipAngle;
      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
      return invalidate();
    };
    projection.clipExtent = function(_) {
      if (!arguments.length) return clipExtent;
      clipExtent = _;
      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
      return invalidate();
    };
    projection.scale = function(_) {
      if (!arguments.length) return k;
      k = +_;
      return reset();
    };
    projection.translate = function(_) {
      if (!arguments.length) return [ x, y ];
      x = +_[0];
      y = +_[1];
      return reset();
    };
    projection.center = function(_) {
      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
      λ = _[0] % 360 * d3_radians;
      φ = _[1] % 360 * d3_radians;
      return reset();
    };
    projection.rotate = function(_) {
      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
      δλ = _[0] % 360 * d3_radians;
      δφ = _[1] % 360 * d3_radians;
      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
      return reset();
    };
    d3.rebind(projection, projectResample, "precision");
    function reset() {
      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
      var center = project(λ, φ);
      δx = x - center[0] * k;
      δy = y + center[1] * k;
      return invalidate();
    }
    function invalidate() {
      if (stream) stream.valid = false, stream = null;
      return projection;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return reset();
    };
  }
  function d3_geo_projectionRadians(stream) {
    return d3_geo_transformPoint(stream, function(x, y) {
      stream.point(x * d3_radians, y * d3_radians);
    });
  }
  function d3_geo_equirectangular(λ, φ) {
    return [ λ, φ ];
  }
  (d3.geo.equirectangular = function() {
    return d3_geo_projection(d3_geo_equirectangular);
  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
  d3.geo.rotation = function(rotate) {
    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    }
    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    };
    return forward;
  };
  function d3_geo_identityRotation(λ, φ) {
    return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
  }
  d3_geo_identityRotation.invert = d3_geo_equirectangular;
  function d3_geo_rotation(δλ, δφ, δγ) {
    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
  }
  function d3_geo_forwardRotationλ(δλ) {
    return function(λ, φ) {
      return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
    };
  }
  function d3_geo_rotationλ(δλ) {
    var rotation = d3_geo_forwardRotationλ(δλ);
    rotation.invert = d3_geo_forwardRotationλ(-δλ);
    return rotation;
  }
  function d3_geo_rotationφγ(δφ, δγ) {
    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
    function rotation(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
    }
    rotation.invert = function(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
    };
    return rotation;
  }
  d3.geo.circle = function() {
    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
    function circle() {
      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
      interpolate(null, null, 1, {
        point: function(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= d3_degrees, x[1] *= d3_degrees;
        }
      });
      return {
        type: "Polygon",
        coordinates: [ ring ]
      };
    }
    circle.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return circle;
    };
    circle.angle = function(x) {
      if (!arguments.length) return angle;
      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
      return circle;
    };
    circle.precision = function(_) {
      if (!arguments.length) return precision;
      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
      return circle;
    };
    return circle.angle(90);
  };
  function d3_geo_circleInterpolate(radius, precision) {
    var cr = Math.cos(radius), sr = Math.sin(radius);
    return function(from, to, direction, listener) {
      var step = direction * precision;
      if (from != null) {
        from = d3_geo_circleAngle(cr, from);
        to = d3_geo_circleAngle(cr, to);
        if (direction > 0 ? from < to : from > to) from += direction * τ;
      } else {
        from = radius + direction * τ;
        to = radius - .5 * step;
      }
      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
      }
    };
  }
  function d3_geo_circleAngle(cr, point) {
    var a = d3_geo_cartesian(point);
    a[0] -= cr;
    d3_geo_cartesianNormalize(a);
    var angle = d3_acos(-a[1]);
    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
  }
  d3.geo.distance = function(a, b) {
    var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
    return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
  };
  d3.geo.graticule = function() {
    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
    function graticule() {
      return {
        type: "MultiLineString",
        coordinates: lines()
      };
    }
    function lines() {
      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
        return abs(x % DX) > ε;
      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
        return abs(y % DY) > ε;
      }).map(y));
    }
    graticule.lines = function() {
      return lines().map(function(coordinates) {
        return {
          type: "LineString",
          coordinates: coordinates
        };
      });
    };
    graticule.outline = function() {
      return {
        type: "Polygon",
        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
      };
    };
    graticule.extent = function(_) {
      if (!arguments.length) return graticule.minorExtent();
      return graticule.majorExtent(_).minorExtent(_);
    };
    graticule.majorExtent = function(_) {
      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
      X0 = +_[0][0], X1 = +_[1][0];
      Y0 = +_[0][1], Y1 = +_[1][1];
      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
      return graticule.precision(precision);
    };
    graticule.minorExtent = function(_) {
      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
      x0 = +_[0][0], x1 = +_[1][0];
      y0 = +_[0][1], y1 = +_[1][1];
      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
      return graticule.precision(precision);
    };
    graticule.step = function(_) {
      if (!arguments.length) return graticule.minorStep();
      return graticule.majorStep(_).minorStep(_);
    };
    graticule.majorStep = function(_) {
      if (!arguments.length) return [ DX, DY ];
      DX = +_[0], DY = +_[1];
      return graticule;
    };
    graticule.minorStep = function(_) {
      if (!arguments.length) return [ dx, dy ];
      dx = +_[0], dy = +_[1];
      return graticule;
    };
    graticule.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = d3_geo_graticuleX(y0, y1, 90);
      y = d3_geo_graticuleY(x0, x1, precision);
      X = d3_geo_graticuleX(Y0, Y1, 90);
      Y = d3_geo_graticuleY(X0, X1, precision);
      return graticule;
    };
    return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
  };
  function d3_geo_graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - ε, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [ x, y ];
      });
    };
  }
  function d3_geo_graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - ε, dx).concat(x1);
    return function(y) {
      return x.map(function(x) {
        return [ x, y ];
      });
    };
  }
  function d3_source(d) {
    return d.source;
  }
  function d3_target(d) {
    return d.target;
  }
  d3.geo.greatArc = function() {
    var source = d3_source, source_, target = d3_target, target_;
    function greatArc() {
      return {
        type: "LineString",
        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
      };
    }
    greatArc.distance = function() {
      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
    };
    greatArc.source = function(_) {
      if (!arguments.length) return source;
      source = _, source_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.target = function(_) {
      if (!arguments.length) return target;
      target = _, target_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.precision = function() {
      return arguments.length ? greatArc : 0;
    };
    return greatArc;
  };
  d3.geo.interpolate = function(source, target) {
    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
  };
  function d3_geo_interpolate(x0, y0, x1, y1) {
    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
    var interpolate = d ? function(t) {
      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
    } : function() {
      return [ x0 * d3_degrees, y0 * d3_degrees ];
    };
    interpolate.distance = d;
    return interpolate;
  }
  d3.geo.length = function(object) {
    d3_geo_lengthSum = 0;
    d3.geo.stream(object, d3_geo_length);
    return d3_geo_lengthSum;
  };
  var d3_geo_lengthSum;
  var d3_geo_length = {
    sphere: d3_noop,
    point: d3_noop,
    lineStart: d3_geo_lengthLineStart,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_lengthLineStart() {
    var λ0, sinφ0, cosφ0;
    d3_geo_length.point = function(λ, φ) {
      λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
      d3_geo_length.point = nextPoint;
    };
    d3_geo_length.lineEnd = function() {
      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
    };
    function nextPoint(λ, φ) {
      var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
      λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
    }
  }
  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(λ, φ) {
      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
    }
    azimuthal.invert = function(x, y) {
      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
    };
    return azimuthal;
  }
  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
    return Math.sqrt(2 / (1 + cosλcosφ));
  }, function(ρ) {
    return 2 * Math.asin(ρ / 2);
  });
  (d3.geo.azimuthalEqualArea = function() {
    return d3_geo_projection(d3_geo_azimuthalEqualArea);
  }).raw = d3_geo_azimuthalEqualArea;
  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
    var c = Math.acos(cosλcosφ);
    return c && c / Math.sin(c);
  }, d3_identity);
  (d3.geo.azimuthalEquidistant = function() {
    return d3_geo_projection(d3_geo_azimuthalEquidistant);
  }).raw = d3_geo_azimuthalEquidistant;
  function d3_geo_conicConformal(φ0, φ1) {
    var cosφ0 = Math.cos(φ0), t = function(φ) {
      return Math.tan(π / 4 + φ / 2);
    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
    if (!n) return d3_geo_mercator;
    function forward(λ, φ) {
      var ρ = abs(abs(φ) - halfπ) < ε ? 0 : F / Math.pow(t(φ), n);
      return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
      return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
    };
    return forward;
  }
  (d3.geo.conicConformal = function() {
    return d3_geo_conic(d3_geo_conicConformal);
  }).raw = d3_geo_conicConformal;
  function d3_geo_conicEquidistant(φ0, φ1) {
    var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
    if (abs(n) < ε) return d3_geo_equirectangular;
    function forward(λ, φ) {
      var ρ = G - φ;
      return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = G - y;
      return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
    };
    return forward;
  }
  (d3.geo.conicEquidistant = function() {
    return d3_geo_conic(d3_geo_conicEquidistant);
  }).raw = d3_geo_conicEquidistant;
  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / cosλcosφ;
  }, Math.atan);
  (d3.geo.gnomonic = function() {
    return d3_geo_projection(d3_geo_gnomonic);
  }).raw = d3_geo_gnomonic;
  function d3_geo_mercator(λ, φ) {
    return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
  }
  d3_geo_mercator.invert = function(x, y) {
    return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
  };
  function d3_geo_mercatorProjection(project) {
    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
    m.scale = function() {
      var v = scale.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.translate = function() {
      var v = translate.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.clipExtent = function(_) {
      var v = clipExtent.apply(m, arguments);
      if (v === m) {
        if (clipAuto = _ == null) {
          var k = π * scale(), t = translate();
          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
        }
      } else if (clipAuto) {
        v = null;
      }
      return v;
    };
    return m.clipExtent(null);
  }
  (d3.geo.mercator = function() {
    return d3_geo_mercatorProjection(d3_geo_mercator);
  }).raw = d3_geo_mercator;
  var d3_geo_orthographic = d3_geo_azimuthal(function() {
    return 1;
  }, Math.asin);
  (d3.geo.orthographic = function() {
    return d3_geo_projection(d3_geo_orthographic);
  }).raw = d3_geo_orthographic;
  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / (1 + cosλcosφ);
  }, function(ρ) {
    return 2 * Math.atan(ρ);
  });
  (d3.geo.stereographic = function() {
    return d3_geo_projection(d3_geo_stereographic);
  }).raw = d3_geo_stereographic;
  function d3_geo_transverseMercator(λ, φ) {
    return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
  }
  d3_geo_transverseMercator.invert = function(x, y) {
    return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
  };
  (d3.geo.transverseMercator = function() {
    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
    projection.center = function(_) {
      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ -_[1], _[0] ]);
    };
    projection.rotate = function(_) {
      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
      [ _[0], _[1], _[2] - 90 ]);
    };
    return projection.rotate([ 0, 0 ]);
  }).raw = d3_geo_transverseMercator;
  d3.geom = {};
  function d3_geom_pointX(d) {
    return d[0];
  }
  function d3_geom_pointY(d) {
    return d[1];
  }
  d3.geom.hull = function(vertices) {
    var x = d3_geom_pointX, y = d3_geom_pointY;
    if (arguments.length) return hull(vertices);
    function hull(data) {
      if (data.length < 3) return [];
      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
      for (i = 0; i < n; i++) {
        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
      }
      points.sort(d3_geom_hullOrder);
      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
      return polygon;
    }
    hull.x = function(_) {
      return arguments.length ? (x = _, hull) : x;
    };
    hull.y = function(_) {
      return arguments.length ? (y = _, hull) : y;
    };
    return hull;
  };
  function d3_geom_hullUpper(points) {
    var n = points.length, hull = [ 0, 1 ], hs = 2;
    for (var i = 2; i < n; i++) {
      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
      hull[hs++] = i;
    }
    return hull.slice(0, hs);
  }
  function d3_geom_hullOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  }
  d3.geom.polygon = function(coordinates) {
    d3_subclass(coordinates, d3_geom_polygonPrototype);
    return coordinates;
  };
  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
  d3_geom_polygonPrototype.area = function() {
    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
    while (++i < n) {
      a = b;
      b = this[i];
      area += a[1] * b[0] - a[0] * b[1];
    }
    return area * .5;
  };
  d3_geom_polygonPrototype.centroid = function(k) {
    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
    if (!arguments.length) k = -1 / (6 * this.area());
    while (++i < n) {
      a = b;
      b = this[i];
      c = a[0] * b[1] - b[0] * a[1];
      x += (a[0] + b[0]) * c;
      y += (a[1] + b[1]) * c;
    }
    return [ x * k, y * k ];
  };
  d3_geom_polygonPrototype.clip = function(subject) {
    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
    while (++i < n) {
      input = subject.slice();
      subject.length = 0;
      b = this[i];
      c = input[(m = input.length - closed) - 1];
      j = -1;
      while (++j < m) {
        d = input[j];
        if (d3_geom_polygonInside(d, a, b)) {
          if (!d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          subject.push(d);
        } else if (d3_geom_polygonInside(c, a, b)) {
          subject.push(d3_geom_polygonIntersect(c, d, a, b));
        }
        c = d;
      }
      if (closed) subject.push(subject[0]);
      a = b;
    }
    return subject;
  };
  function d3_geom_polygonInside(p, a, b) {
    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  }
  function d3_geom_polygonIntersect(c, d, a, b) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [ x1 + ua * x21, y1 + ua * y21 ];
  }
  function d3_geom_polygonClosed(coordinates) {
    var a = coordinates[0], b = coordinates[coordinates.length - 1];
    return !(a[0] - b[0] || a[1] - b[1]);
  }
  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
  function d3_geom_voronoiBeach() {
    d3_geom_voronoiRedBlackNode(this);
    this.edge = this.site = this.circle = null;
  }
  function d3_geom_voronoiCreateBeach(site) {
    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
    beach.site = site;
    return beach;
  }
  function d3_geom_voronoiDetachBeach(beach) {
    d3_geom_voronoiDetachCircle(beach);
    d3_geom_voronoiBeaches.remove(beach);
    d3_geom_voronoiBeachPool.push(beach);
    d3_geom_voronoiRedBlackNode(beach);
  }
  function d3_geom_voronoiRemoveBeach(beach) {
    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
      x: x,
      y: y
    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
    d3_geom_voronoiDetachBeach(beach);
    var lArc = previous;
    while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
      previous = lArc.P;
      disappearing.unshift(lArc);
      d3_geom_voronoiDetachBeach(lArc);
      lArc = previous;
    }
    disappearing.unshift(lArc);
    d3_geom_voronoiDetachCircle(lArc);
    var rArc = next;
    while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
      next = rArc.N;
      disappearing.push(rArc);
      d3_geom_voronoiDetachBeach(rArc);
      rArc = next;
    }
    disappearing.push(rArc);
    d3_geom_voronoiDetachCircle(rArc);
    var nArcs = disappearing.length, iArc;
    for (iArc = 1; iArc < nArcs; ++iArc) {
      rArc = disappearing[iArc];
      lArc = disappearing[iArc - 1];
      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
    }
    lArc = disappearing[0];
    rArc = disappearing[nArcs - 1];
    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiAddBeach(site) {
    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
    while (node) {
      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
      if (dxl > ε) node = node.L; else {
        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
        if (dxr > ε) {
          if (!node.R) {
            lArc = node;
            break;
          }
          node = node.R;
        } else {
          if (dxl > -ε) {
            lArc = node.P;
            rArc = node;
          } else if (dxr > -ε) {
            lArc = node;
            rArc = node.N;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    var newArc = d3_geom_voronoiCreateBeach(site);
    d3_geom_voronoiBeaches.insert(lArc, newArc);
    if (!lArc && !rArc) return;
    if (lArc === rArc) {
      d3_geom_voronoiDetachCircle(lArc);
      rArc = d3_geom_voronoiCreateBeach(lArc.site);
      d3_geom_voronoiBeaches.insert(newArc, rArc);
      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      d3_geom_voronoiAttachCircle(lArc);
      d3_geom_voronoiAttachCircle(rArc);
      return;
    }
    if (!rArc) {
      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      return;
    }
    d3_geom_voronoiDetachCircle(lArc);
    d3_geom_voronoiDetachCircle(rArc);
    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
      x: (cy * hb - by * hc) / d + ax,
      y: (bx * hc - cx * hb) / d + ay
    };
    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
    if (!pby2) return rfocx;
    var lArc = arc.P;
    if (!lArc) return -Infinity;
    site = lArc.site;
    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
    if (!plby2) return lfocx;
    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    return (rfocx + lfocx) / 2;
  }
  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
    var rArc = arc.N;
    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
    var site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }
  function d3_geom_voronoiCell(site) {
    this.site = site;
    this.edges = [];
  }
  d3_geom_voronoiCell.prototype.prepare = function() {
    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
    while (iHalfEdge--) {
      edge = halfEdges[iHalfEdge].edge;
      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
    }
    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
    return halfEdges.length;
  };
  function d3_geom_voronoiCloseCells(extent) {
    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
    while (iCell--) {
      cell = cells[iCell];
      if (!cell || !cell.prepare()) continue;
      halfEdges = cell.edges;
      nHalfEdges = halfEdges.length;
      iHalfEdge = 0;
      while (iHalfEdge < nHalfEdges) {
        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
            x: x0,
            y: abs(x2 - x0) < ε ? y2 : y1
          } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
            x: abs(y2 - y1) < ε ? x2 : x1,
            y: y1
          } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
            x: x1,
            y: abs(x2 - x1) < ε ? y2 : y0
          } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
            x: abs(y2 - y0) < ε ? x2 : x0,
            y: y0
          } : null), cell.site, null));
          ++nHalfEdges;
        }
      }
    }
  }
  function d3_geom_voronoiHalfEdgeOrder(a, b) {
    return b.angle - a.angle;
  }
  function d3_geom_voronoiCircle() {
    d3_geom_voronoiRedBlackNode(this);
    this.x = this.y = this.arc = this.site = this.cy = null;
  }
  function d3_geom_voronoiAttachCircle(arc) {
    var lArc = arc.P, rArc = arc.N;
    if (!lArc || !rArc) return;
    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
    if (lSite === rSite) return;
    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
    var d = 2 * (ax * cy - ay * cx);
    if (d >= -ε2) return;
    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
    circle.arc = arc;
    circle.site = cSite;
    circle.x = x + bx;
    circle.y = cy + Math.sqrt(x * x + y * y);
    circle.cy = cy;
    arc.circle = circle;
    var before = null, node = d3_geom_voronoiCircles._;
    while (node) {
      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
        if (node.L) node = node.L; else {
          before = node.P;
          break;
        }
      } else {
        if (node.R) node = node.R; else {
          before = node;
          break;
        }
      }
    }
    d3_geom_voronoiCircles.insert(before, circle);
    if (!before) d3_geom_voronoiFirstCircle = circle;
  }
  function d3_geom_voronoiDetachCircle(arc) {
    var circle = arc.circle;
    if (circle) {
      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
      d3_geom_voronoiCircles.remove(circle);
      d3_geom_voronoiCirclePool.push(circle);
      d3_geom_voronoiRedBlackNode(circle);
      arc.circle = null;
    }
  }
  function d3_geom_voronoiClipEdges(extent) {
    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
    while (i--) {
      e = edges[i];
      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
        e.a = e.b = null;
        edges.splice(i, 1);
      }
    }
  }
  function d3_geom_voronoiConnectEdge(edge, extent) {
    var vb = edge.b;
    if (vb) return true;
    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
    if (ry === ly) {
      if (fx < x0 || fx >= x1) return;
      if (lx > rx) {
        if (!va) va = {
          x: fx,
          y: y0
        }; else if (va.y >= y1) return;
        vb = {
          x: fx,
          y: y1
        };
      } else {
        if (!va) va = {
          x: fx,
          y: y1
        }; else if (va.y < y0) return;
        vb = {
          x: fx,
          y: y0
        };
      }
    } else {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
      if (fm < -1 || fm > 1) {
        if (lx > rx) {
          if (!va) va = {
            x: (y0 - fb) / fm,
            y: y0
          }; else if (va.y >= y1) return;
          vb = {
            x: (y1 - fb) / fm,
            y: y1
          };
        } else {
          if (!va) va = {
            x: (y1 - fb) / fm,
            y: y1
          }; else if (va.y < y0) return;
          vb = {
            x: (y0 - fb) / fm,
            y: y0
          };
        }
      } else {
        if (ly < ry) {
          if (!va) va = {
            x: x0,
            y: fm * x0 + fb
          }; else if (va.x >= x1) return;
          vb = {
            x: x1,
            y: fm * x1 + fb
          };
        } else {
          if (!va) va = {
            x: x1,
            y: fm * x1 + fb
          }; else if (va.x < x0) return;
          vb = {
            x: x0,
            y: fm * x0 + fb
          };
        }
      }
    }
    edge.a = va;
    edge.b = vb;
    return true;
  }
  function d3_geom_voronoiEdge(lSite, rSite) {
    this.l = lSite;
    this.r = rSite;
    this.a = this.b = null;
  }
  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, rSite);
    d3_geom_voronoiEdges.push(edge);
    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
    return edge;
  }
  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, null);
    edge.a = va;
    edge.b = vb;
    d3_geom_voronoiEdges.push(edge);
    return edge;
  }
  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
    if (!edge.a && !edge.b) {
      edge.a = vertex;
      edge.l = lSite;
      edge.r = rSite;
    } else if (edge.l === rSite) {
      edge.b = vertex;
    } else {
      edge.a = vertex;
    }
  }
  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
    var va = edge.a, vb = edge.b;
    this.edge = edge;
    this.site = lSite;
    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
  }
  d3_geom_voronoiHalfEdge.prototype = {
    start: function() {
      return this.edge.l === this.site ? this.edge.a : this.edge.b;
    },
    end: function() {
      return this.edge.l === this.site ? this.edge.b : this.edge.a;
    }
  };
  function d3_geom_voronoiRedBlackTree() {
    this._ = null;
  }
  function d3_geom_voronoiRedBlackNode(node) {
    node.U = node.C = node.L = node.R = node.P = node.N = null;
  }
  d3_geom_voronoiRedBlackTree.prototype = {
    insert: function(after, node) {
      var parent, grandpa, uncle;
      if (after) {
        node.P = after;
        node.N = after.N;
        if (after.N) after.N.P = node;
        after.N = node;
        if (after.R) {
          after = after.R;
          while (after.L) after = after.L;
          after.L = node;
        } else {
          after.R = node;
        }
        parent = after;
      } else if (this._) {
        after = d3_geom_voronoiRedBlackFirst(this._);
        node.P = null;
        node.N = after;
        after.P = after.L = node;
        parent = after;
      } else {
        node.P = node.N = null;
        this._ = node;
        parent = null;
      }
      node.L = node.R = null;
      node.U = parent;
      node.C = true;
      after = node;
      while (parent && parent.C) {
        grandpa = parent.U;
        if (parent === grandpa.L) {
          uncle = grandpa.R;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.R) {
              d3_geom_voronoiRedBlackRotateLeft(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
          }
        } else {
          uncle = grandpa.L;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.L) {
              d3_geom_voronoiRedBlackRotateRight(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
          }
        }
        parent = after.U;
      }
      this._.C = false;
    },
    remove: function(node) {
      if (node.N) node.N.P = node.P;
      if (node.P) node.P.N = node.N;
      node.N = node.P = null;
      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
      if (parent) {
        if (parent.L === node) parent.L = next; else parent.R = next;
      } else {
        this._ = next;
      }
      if (left && right) {
        red = next.C;
        next.C = node.C;
        next.L = left;
        left.U = next;
        if (next !== right) {
          parent = next.U;
          next.U = node.U;
          node = next.R;
          parent.L = node;
          next.R = right;
          right.U = next;
        } else {
          next.U = parent;
          parent = next;
          node = next.R;
        }
      } else {
        red = node.C;
        node = next;
      }
      if (node) node.U = parent;
      if (red) return;
      if (node && node.C) {
        node.C = false;
        return;
      }
      do {
        if (node === this._) break;
        if (node === parent.L) {
          sibling = parent.R;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            sibling = parent.R;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.R || !sibling.R.C) {
              sibling.L.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateRight(this, sibling);
              sibling = parent.R;
            }
            sibling.C = parent.C;
            parent.C = sibling.R.C = false;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            node = this._;
            break;
          }
        } else {
          sibling = parent.L;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            sibling = parent.L;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.L || !sibling.L.C) {
              sibling.R.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
              sibling = parent.L;
            }
            sibling.C = parent.C;
            parent.C = sibling.L.C = false;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            node = this._;
            break;
          }
        }
        sibling.C = true;
        node = parent;
        parent = parent.U;
      } while (!node.C);
      if (node) node.C = false;
    }
  };
  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
    var p = node, q = node.R, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.R = q.L;
    if (p.R) p.R.U = p;
    q.L = p;
  }
  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
    var p = node, q = node.L, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.L = q.R;
    if (p.L) p.L.U = p;
    q.R = p;
  }
  function d3_geom_voronoiRedBlackFirst(node) {
    while (node.L) node = node.L;
    return node;
  }
  function d3_geom_voronoi(sites, bbox) {
    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
    d3_geom_voronoiEdges = [];
    d3_geom_voronoiCells = new Array(sites.length);
    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
    while (true) {
      circle = d3_geom_voronoiFirstCircle;
      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
        if (site.x !== x0 || site.y !== y0) {
          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
          d3_geom_voronoiAddBeach(site);
          x0 = site.x, y0 = site.y;
        }
        site = sites.pop();
      } else if (circle) {
        d3_geom_voronoiRemoveBeach(circle.arc);
      } else {
        break;
      }
    }
    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
    var diagram = {
      cells: d3_geom_voronoiCells,
      edges: d3_geom_voronoiEdges
    };
    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
    return diagram;
  }
  function d3_geom_voronoiVertexOrder(a, b) {
    return b.y - a.y || b.x - a.x;
  }
  d3.geom.voronoi = function(points) {
    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
    if (points) return voronoi(points);
    function voronoi(data) {
      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
          var s = e.start();
          return [ s.x, s.y ];
        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
        polygon.point = data[i];
      });
      return polygons;
    }
    function sites(data) {
      return data.map(function(d, i) {
        return {
          x: Math.round(fx(d, i) / ε) * ε,
          y: Math.round(fy(d, i) / ε) * ε,
          i: i
        };
      });
    }
    voronoi.links = function(data) {
      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
        return edge.l && edge.r;
      }).map(function(edge) {
        return {
          source: data[edge.l.i],
          target: data[edge.r.i]
        };
      });
    };
    voronoi.triangles = function(data) {
      var triangles = [];
      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
        while (++j < m) {
          e0 = e1;
          s0 = s1;
          e1 = edges[j].edge;
          s1 = e1.l === site ? e1.r : e1.l;
          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
          }
        }
      });
      return triangles;
    };
    voronoi.x = function(_) {
      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
    };
    voronoi.y = function(_) {
      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
    };
    voronoi.clipExtent = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
      return voronoi;
    };
    voronoi.size = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
    };
    return voronoi;
  };
  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
  function d3_geom_voronoiTriangleArea(a, b, c) {
    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
  }
  d3.geom.delaunay = function(vertices) {
    return d3.geom.voronoi().triangles(vertices);
  };
  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
    if (compat = arguments.length) {
      x = d3_geom_quadtreeCompatX;
      y = d3_geom_quadtreeCompatY;
      if (compat === 3) {
        y2 = y1;
        x2 = x1;
        y1 = x1 = 0;
      }
      return quadtree(points);
    }
    function quadtree(data) {
      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
      if (x1 != null) {
        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
      } else {
        x2_ = y2_ = -(x1_ = y1_ = Infinity);
        xs = [], ys = [];
        n = data.length;
        if (compat) for (i = 0; i < n; ++i) {
          d = data[i];
          if (d.x < x1_) x1_ = d.x;
          if (d.y < y1_) y1_ = d.y;
          if (d.x > x2_) x2_ = d.x;
          if (d.y > y2_) y2_ = d.y;
          xs.push(d.x);
          ys.push(d.y);
        } else for (i = 0; i < n; ++i) {
          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
          if (x_ < x1_) x1_ = x_;
          if (y_ < y1_) y1_ = y_;
          if (x_ > x2_) x2_ = x_;
          if (y_ > y2_) y2_ = y_;
          xs.push(x_);
          ys.push(y_);
        }
      }
      var dx = x2_ - x1_, dy = y2_ - y1_;
      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
      function insert(n, d, x, y, x1, y1, x2, y2) {
        if (isNaN(x) || isNaN(y)) return;
        if (n.leaf) {
          var nx = n.x, ny = n.y;
          if (nx != null) {
            if (abs(nx - x) + abs(ny - y) < .01) {
              insertChild(n, d, x, y, x1, y1, x2, y2);
            } else {
              var nPoint = n.point;
              n.x = n.y = n.point = null;
              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
              insertChild(n, d, x, y, x1, y1, x2, y2);
            }
          } else {
            n.x = x, n.y = y, n.point = d;
          }
        } else {
          insertChild(n, d, x, y, x1, y1, x2, y2);
        }
      }
      function insertChild(n, d, x, y, x1, y1, x2, y2) {
        var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, right = x >= sx, bottom = y >= sy, i = (bottom << 1) + right;
        n.leaf = false;
        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
        if (right) x1 = sx; else x2 = sx;
        if (bottom) y1 = sy; else y2 = sy;
        insert(n, d, x, y, x1, y1, x2, y2);
      }
      var root = d3_geom_quadtreeNode();
      root.add = function(d) {
        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
      };
      root.visit = function(f) {
        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
      };
      i = -1;
      if (x1 == null) {
        while (++i < n) {
          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
        }
        --i;
      } else data.forEach(root.add);
      xs = ys = data = d = null;
      return root;
    }
    quadtree.x = function(_) {
      return arguments.length ? (x = _, quadtree) : x;
    };
    quadtree.y = function(_) {
      return arguments.length ? (y = _, quadtree) : y;
    };
    quadtree.extent = function(_) {
      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
      y2 = +_[1][1];
      return quadtree;
    };
    quadtree.size = function(_) {
      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
      return quadtree;
    };
    return quadtree;
  };
  function d3_geom_quadtreeCompatX(d) {
    return d.x;
  }
  function d3_geom_quadtreeCompatY(d) {
    return d.y;
  }
  function d3_geom_quadtreeNode() {
    return {
      leaf: true,
      nodes: [],
      point: null,
      x: null,
      y: null
    };
  }
  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
    if (!f(node, x1, y1, x2, y2)) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
    }
  }
  d3.interpolateRgb = d3_interpolateRgb;
  function d3_interpolateRgb(a, b) {
    a = d3.rgb(a);
    b = d3.rgb(b);
    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
    return function(t) {
      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
    };
  }
  d3.interpolateObject = d3_interpolateObject;
  function d3_interpolateObject(a, b) {
    var i = {}, c = {}, k;
    for (k in a) {
      if (k in b) {
        i[k] = d3_interpolate(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }
  d3.interpolateNumber = d3_interpolateNumber;
  function d3_interpolateNumber(a, b) {
    b -= a = +a;
    return function(t) {
      return a + b * t;
    };
  }
  d3.interpolateString = d3_interpolateString;
  function d3_interpolateString(a, b) {
    var m, i, j, s0 = 0, s1 = 0, s = [], q = [], n, o;
    a = a + "", b = b + "";
    d3_interpolate_number.lastIndex = 0;
    for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
      if (m.index) s.push(b.substring(s0, s1 = m.index));
      q.push({
        i: s.length,
        x: m[0]
      });
      s.push(null);
      s0 = d3_interpolate_number.lastIndex;
    }
    if (s0 < b.length) s.push(b.substring(s0));
    for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
      o = q[i];
      if (o.x == m[0]) {
        if (o.i) {
          if (s[o.i + 1] == null) {
            s[o.i - 1] += o.x;
            s.splice(o.i, 1);
            for (j = i + 1; j < n; ++j) q[j].i--;
          } else {
            s[o.i - 1] += o.x + s[o.i + 1];
            s.splice(o.i, 2);
            for (j = i + 1; j < n; ++j) q[j].i -= 2;
          }
        } else {
          if (s[o.i + 1] == null) {
            s[o.i] = o.x;
          } else {
            s[o.i] = o.x + s[o.i + 1];
            s.splice(o.i + 1, 1);
            for (j = i + 1; j < n; ++j) q[j].i--;
          }
        }
        q.splice(i, 1);
        n--;
        i--;
      } else {
        o.x = d3_interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
      }
    }
    while (i < n) {
      o = q.pop();
      if (s[o.i + 1] == null) {
        s[o.i] = o.x;
      } else {
        s[o.i] = o.x + s[o.i + 1];
        s.splice(o.i + 1, 1);
      }
      n--;
    }
    if (s.length === 1) {
      return s[0] == null ? (o = q[0].x, function(t) {
        return o(t) + "";
      }) : function() {
        return b;
      };
    }
    return function(t) {
      for (i = 0; i < n; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }
  var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  d3.interpolate = d3_interpolate;
  function d3_interpolate(a, b) {
    var i = d3.interpolators.length, f;
    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
    return f;
  }
  d3.interpolators = [ function(a, b) {
    var t = typeof b;
    return (t === "string" ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_Color ? d3_interpolateRgb : t === "object" ? Array.isArray(b) ? d3_interpolateArray : d3_interpolateObject : d3_interpolateNumber)(a, b);
  } ];
  d3.interpolateArray = d3_interpolateArray;
  function d3_interpolateArray(a, b) {
    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
    for (;i < na; ++i) c[i] = a[i];
    for (;i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  }
  var d3_ease_default = function() {
    return d3_identity;
  };
  var d3_ease = d3.map({
    linear: d3_ease_default,
    poly: d3_ease_poly,
    quad: function() {
      return d3_ease_quad;
    },
    cubic: function() {
      return d3_ease_cubic;
    },
    sin: function() {
      return d3_ease_sin;
    },
    exp: function() {
      return d3_ease_exp;
    },
    circle: function() {
      return d3_ease_circle;
    },
    elastic: d3_ease_elastic,
    back: d3_ease_back,
    bounce: function() {
      return d3_ease_bounce;
    }
  });
  var d3_ease_mode = d3.map({
    "in": d3_identity,
    out: d3_ease_reverse,
    "in-out": d3_ease_reflect,
    "out-in": function(f) {
      return d3_ease_reflect(d3_ease_reverse(f));
    }
  });
  d3.ease = function(name) {
    var i = name.indexOf("-"), t = i >= 0 ? name.substring(0, i) : name, m = i >= 0 ? name.substring(i + 1) : "in";
    t = d3_ease.get(t) || d3_ease_default;
    m = d3_ease_mode.get(m) || d3_identity;
    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
  };
  function d3_ease_clamp(f) {
    return function(t) {
      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
    };
  }
  function d3_ease_reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }
  function d3_ease_reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
    };
  }
  function d3_ease_quad(t) {
    return t * t;
  }
  function d3_ease_cubic(t) {
    return t * t * t;
  }
  function d3_ease_cubicInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
  }
  function d3_ease_poly(e) {
    return function(t) {
      return Math.pow(t, e);
    };
  }
  function d3_ease_sin(t) {
    return 1 - Math.cos(t * halfπ);
  }
  function d3_ease_exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }
  function d3_ease_circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  function d3_ease_elastic(a, p) {
    var s;
    if (arguments.length < 2) p = .45;
    if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
    return function(t) {
      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
    };
  }
  function d3_ease_back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }
  function d3_ease_bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
  d3.interpolateHcl = d3_interpolateHcl;
  function d3_interpolateHcl(a, b) {
    a = d3.hcl(a);
    b = d3.hcl(b);
    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
    };
  }
  d3.interpolateHsl = d3_interpolateHsl;
  function d3_interpolateHsl(a, b) {
    a = d3.hsl(a);
    b = d3.hsl(b);
    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
    };
  }
  d3.interpolateLab = d3_interpolateLab;
  function d3_interpolateLab(a, b) {
    a = d3.lab(a);
    b = d3.lab(b);
    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
    return function(t) {
      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  }
  d3.interpolateRound = d3_interpolateRound;
  function d3_interpolateRound(a, b) {
    b -= a;
    return function(t) {
      return Math.round(a + b * t);
    };
  }
  d3.transform = function(string) {
    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
    return (d3.transform = function(string) {
      if (string != null) {
        g.setAttribute("transform", string);
        var t = g.transform.baseVal.consolidate();
      }
      return new d3_transform(t ? t.matrix : d3_transformIdentity);
    })(string);
  };
  function d3_transform(m) {
    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }
    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
    this.translate = [ m.e, m.f ];
    this.scale = [ kx, ky ];
    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
  }
  d3_transform.prototype.toString = function() {
    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
  };
  function d3_transformDot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function d3_transformNormalize(a) {
    var k = Math.sqrt(d3_transformDot(a, a));
    if (k) {
      a[0] /= k;
      a[1] /= k;
    }
    return k;
  }
  function d3_transformCombine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }
  var d3_transformIdentity = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
  };
  d3.interpolateTransform = d3_interpolateTransform;
  function d3_interpolateTransform(a, b) {
    var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
    if (ta[0] != tb[0] || ta[1] != tb[1]) {
      s.push("translate(", null, ",", null, ")");
      q.push({
        i: 1,
        x: d3_interpolateNumber(ta[0], tb[0])
      }, {
        i: 3,
        x: d3_interpolateNumber(ta[1], tb[1])
      });
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    } else {
      s.push("");
    }
    if (ra != rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
      q.push({
        i: s.push(s.pop() + "rotate(", null, ")") - 2,
        x: d3_interpolateNumber(ra, rb)
      });
    } else if (rb) {
      s.push(s.pop() + "rotate(" + rb + ")");
    }
    if (wa != wb) {
      q.push({
        i: s.push(s.pop() + "skewX(", null, ")") - 2,
        x: d3_interpolateNumber(wa, wb)
      });
    } else if (wb) {
      s.push(s.pop() + "skewX(" + wb + ")");
    }
    if (ka[0] != kb[0] || ka[1] != kb[1]) {
      n = s.push(s.pop() + "scale(", null, ",", null, ")");
      q.push({
        i: n - 4,
        x: d3_interpolateNumber(ka[0], kb[0])
      }, {
        i: n - 2,
        x: d3_interpolateNumber(ka[1], kb[1])
      });
    } else if (kb[0] != 1 || kb[1] != 1) {
      s.push(s.pop() + "scale(" + kb + ")");
    }
    n = q.length;
    return function(t) {
      var i = -1, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }
  function d3_uninterpolateNumber(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      return (x - a) * b;
    };
  }
  function d3_uninterpolateClamp(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) * b));
    };
  }
  d3.layout = {};
  d3.layout.bundle = function() {
    return function(links) {
      var paths = [], i = -1, n = links.length;
      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
      return paths;
    };
  };
  function d3_layout_bundlePath(link) {
    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
    while (start !== lca) {
      start = start.parent;
      points.push(start);
    }
    var k = points.length;
    while (end !== lca) {
      points.splice(k, 0, end);
      end = end.parent;
    }
    return points;
  }
  function d3_layout_bundleAncestors(node) {
    var ancestors = [], parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }
  function d3_layout_bundleLeastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    return sharedNode;
  }
  d3.layout.chord = function() {
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
      chords = [];
      groups = [];
      k = 0, i = -1;
      while (++i < n) {
        x = 0, j = -1;
        while (++j < n) {
          x += matrix[i][j];
        }
        groupSums.push(x);
        subgroupIndex.push(d3.range(n));
        k += x;
      }
      if (sortGroups) {
        groupIndex.sort(function(a, b) {
          return sortGroups(groupSums[a], groupSums[b]);
        });
      }
      if (sortSubgroups) {
        subgroupIndex.forEach(function(d, i) {
          d.sort(function(a, b) {
            return sortSubgroups(matrix[i][a], matrix[i][b]);
          });
        });
      }
      k = (τ - padding * n) / k;
      x = 0, i = -1;
      while (++i < n) {
        x0 = x, j = -1;
        while (++j < n) {
          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
          subgroups[di + "-" + dj] = {
            index: di,
            subindex: dj,
            startAngle: a0,
            endAngle: a1,
            value: v
          };
        }
        groups[di] = {
          index: di,
          startAngle: x0,
          endAngle: x,
          value: (x - x0) / k
        };
        x += padding;
      }
      i = -1;
      while (++i < n) {
        j = i - 1;
        while (++j < n) {
          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
          if (source.value || target.value) {
            chords.push(source.value < target.value ? {
              source: target,
              target: source
            } : {
              source: source,
              target: target
            });
          }
        }
      }
      if (sortChords) resort();
    }
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
  };
  d3.layout.force = function() {
    var force = {}, event = d3.dispatch("start", "tick", "end"), size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
    function repulse(node) {
      return function(quad, x1, _, x2) {
        if (quad.point !== node) {
          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
          if (dw * dw / theta2 < dn) {
            if (dn < chargeDistance2) {
              var k = quad.charge / dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
            return true;
          }
          if (quad.point && dn && dn < chargeDistance2) {
            var k = quad.pointCharge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
        }
        return !quad.charge;
      };
    }
    force.tick = function() {
      if ((alpha *= .99) < .005) {
        event.end({
          type: "end",
          alpha: alpha = 0
        });
        return true;
      }
      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
      for (i = 0; i < m; ++i) {
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = x * x + y * y) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1;
        if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1;
        while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }
      event.tick({
        type: "tick",
        alpha: alpha
      });
    };
    force.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return force;
    };
    force.links = function(x) {
      if (!arguments.length) return links;
      links = x;
      return force;
    };
    force.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return force;
    };
    force.linkDistance = function(x) {
      if (!arguments.length) return linkDistance;
      linkDistance = typeof x === "function" ? x : +x;
      return force;
    };
    force.distance = force.linkDistance;
    force.linkStrength = function(x) {
      if (!arguments.length) return linkStrength;
      linkStrength = typeof x === "function" ? x : +x;
      return force;
    };
    force.friction = function(x) {
      if (!arguments.length) return friction;
      friction = +x;
      return force;
    };
    force.charge = function(x) {
      if (!arguments.length) return charge;
      charge = typeof x === "function" ? x : +x;
      return force;
    };
    force.chargeDistance = function(x) {
      if (!arguments.length) return Math.sqrt(chargeDistance2);
      chargeDistance2 = x * x;
      return force;
    };
    force.gravity = function(x) {
      if (!arguments.length) return gravity;
      gravity = +x;
      return force;
    };
    force.theta = function(x) {
      if (!arguments.length) return Math.sqrt(theta2);
      theta2 = x * x;
      return force;
    };
    force.alpha = function(x) {
      if (!arguments.length) return alpha;
      x = +x;
      if (alpha) {
        if (x > 0) alpha = x; else alpha = 0;
      } else if (x > 0) {
        event.start({
          type: "start",
          alpha: alpha = x
        });
        d3.timer(force.tick);
      }
      return force;
    };
    force.start = function() {
      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
      for (i = 0; i < n; ++i) {
        (o = nodes[i]).index = i;
        o.weight = 0;
      }
      for (i = 0; i < m; ++i) {
        o = links[i];
        if (typeof o.source == "number") o.source = nodes[o.source];
        if (typeof o.target == "number") o.target = nodes[o.target];
        ++o.source.weight;
        ++o.target.weight;
      }
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (isNaN(o.x)) o.x = position("x", w);
        if (isNaN(o.y)) o.y = position("y", h);
        if (isNaN(o.px)) o.px = o.x;
        if (isNaN(o.py)) o.py = o.y;
      }
      distances = [];
      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
      strengths = [];
      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
      charges = [];
      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
      function position(dimension, size) {
        if (!neighbors) {
          neighbors = new Array(n);
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
        }
        var candidates = neighbors[i], j = -1, m = candidates.length, x;
        while (++j < m) if (!isNaN(x = candidates[j][dimension])) return x;
        return Math.random() * size;
      }
      return force.resume();
    };
    force.resume = function() {
      return force.alpha(.1);
    };
    force.stop = function() {
      return force.alpha(0);
    };
    force.drag = function() {
      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
      if (!arguments.length) return drag;
      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
    };
    function dragmove(d) {
      d.px = d3.event.x, d.py = d3.event.y;
      force.resume();
    }
    return d3.rebind(force, event, "on");
  };
  function d3_layout_forceDragstart(d) {
    d.fixed |= 2;
  }
  function d3_layout_forceDragend(d) {
    d.fixed &= ~6;
  }
  function d3_layout_forceMouseover(d) {
    d.fixed |= 4;
    d.px = d.x, d.py = d.y;
  }
  function d3_layout_forceMouseout(d) {
    d.fixed &= ~4;
  }
  function d3_layout_forceAccumulate(quad, alpha, charges) {
    var cx = 0, cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      var nodes = quad.nodes, n = nodes.length, i = -1, c;
      while (++i < n) {
        c = nodes[i];
        if (c == null) continue;
        d3_layout_forceAccumulate(c, alpha, charges);
        quad.charge += c.charge;
        cx += c.charge * c.cx;
        cy += c.charge * c.cy;
      }
    }
    if (quad.point) {
      if (!quad.leaf) {
        quad.point.x += Math.random() - .5;
        quad.point.y += Math.random() - .5;
      }
      var k = alpha * charges[quad.point.index];
      quad.charge += quad.pointCharge = k;
      cx += k * quad.point.x;
      cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }
  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
  d3.layout.hierarchy = function() {
    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
    function recurse(node, depth, nodes) {
      var childs = children.call(hierarchy, node, depth);
      node.depth = depth;
      nodes.push(node);
      if (childs && (n = childs.length)) {
        var i = -1, n, c = node.children = new Array(n), v = 0, j = depth + 1, d;
        while (++i < n) {
          d = c[i] = recurse(childs[i], j, nodes);
          d.parent = node;
          v += d.value;
        }
        if (sort) c.sort(sort);
        if (value) node.value = v;
      } else {
        delete node.children;
        if (value) {
          node.value = +value.call(hierarchy, node, depth) || 0;
        }
      }
      return node;
    }
    function revalue(node, depth) {
      var children = node.children, v = 0;
      if (children && (n = children.length)) {
        var i = -1, n, j = depth + 1;
        while (++i < n) v += revalue(children[i], j);
      } else if (value) {
        v = +value.call(hierarchy, node, depth) || 0;
      }
      if (value) node.value = v;
      return v;
    }
    function hierarchy(d) {
      var nodes = [];
      recurse(d, 0, nodes);
      return nodes;
    }
    hierarchy.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return hierarchy;
    };
    hierarchy.children = function(x) {
      if (!arguments.length) return children;
      children = x;
      return hierarchy;
    };
    hierarchy.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return hierarchy;
    };
    hierarchy.revalue = function(root) {
      revalue(root, 0);
      return root;
    };
    return hierarchy;
  };
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyChildren(d) {
    return d.children;
  }
  function d3_layout_hierarchyValue(d) {
    return d.value;
  }
  function d3_layout_hierarchySort(a, b) {
    return b.value - a.value;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  d3.layout.partition = function() {
    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
    function position(node, x, dx, dy) {
      var children = node.children;
      node.x = x;
      node.y = node.depth * dy;
      node.dx = dx;
      node.dy = dy;
      if (children && (n = children.length)) {
        var i = -1, n, c, d;
        dx = node.value ? dx / node.value : 0;
        while (++i < n) {
          position(c = children[i], x, d = c.value * dx, dy);
          x += d;
        }
      }
    }
    function depth(node) {
      var children = node.children, d = 0;
      if (children && (n = children.length)) {
        var i = -1, n;
        while (++i < n) d = Math.max(d, depth(children[i]));
      }
      return 1 + d;
    }
    function partition(d, i) {
      var nodes = hierarchy.call(this, d, i);
      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
      return nodes;
    }
    partition.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return partition;
    };
    return d3_layout_hierarchyRebind(partition, hierarchy);
  };
  d3.layout.pie = function() {
    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ;
    function pie(data) {
      var values = data.map(function(d, i) {
        return +value.call(pie, d, i);
      });
      var a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle);
      var k = ((typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a) / d3.sum(values);
      var index = d3.range(data.length);
      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
        return values[j] - values[i];
      } : function(i, j) {
        return sort(data[i], data[j]);
      });
      var arcs = [];
      index.forEach(function(i) {
        var d;
        arcs[i] = {
          data: data[i],
          value: d = values[i],
          startAngle: a,
          endAngle: a += d * k
        };
      });
      return arcs;
    }
    pie.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return pie;
    };
    pie.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return pie;
    };
    pie.startAngle = function(x) {
      if (!arguments.length) return startAngle;
      startAngle = x;
      return pie;
    };
    pie.endAngle = function(x) {
      if (!arguments.length) return endAngle;
      endAngle = x;
      return pie;
    };
    return pie;
  };
  var d3_layout_pieSortByValue = {};
  d3.layout.stack = function() {
    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
    function stack(data, index) {
      var series = data.map(function(d, i) {
        return values.call(stack, d, i);
      });
      var points = series.map(function(d) {
        return d.map(function(v, i) {
          return [ x.call(stack, v, i), y.call(stack, v, i) ];
        });
      });
      var orders = order.call(stack, points, index);
      series = d3.permute(series, orders);
      points = d3.permute(points, orders);
      var offsets = offset.call(stack, points, index);
      var n = series.length, m = series[0].length, i, j, o;
      for (j = 0; j < m; ++j) {
        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
        for (i = 1; i < n; ++i) {
          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
        }
      }
      return data;
    }
    stack.values = function(x) {
      if (!arguments.length) return values;
      values = x;
      return stack;
    };
    stack.order = function(x) {
      if (!arguments.length) return order;
      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
      return stack;
    };
    stack.offset = function(x) {
      if (!arguments.length) return offset;
      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
      return stack;
    };
    stack.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      return stack;
    };
    stack.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      return stack;
    };
    stack.out = function(z) {
      if (!arguments.length) return out;
      out = z;
      return stack;
    };
    return stack;
  };
  function d3_layout_stackX(d) {
    return d.x;
  }
  function d3_layout_stackY(d) {
    return d.y;
  }
  function d3_layout_stackOut(d, y0, y) {
    d.y0 = y0;
    d.y = y;
  }
  var d3_layout_stackOrders = d3.map({
    "inside-out": function(data) {
      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
        return max[a] - max[b];
      }), top = 0, bottom = 0, tops = [], bottoms = [];
      for (i = 0; i < n; ++i) {
        j = index[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }
      return bottoms.reverse().concat(tops);
    },
    reverse: function(data) {
      return d3.range(data.length).reverse();
    },
    "default": d3_layout_stackOrderDefault
  });
  var d3_layout_stackOffsets = d3.map({
    silhouette: function(data) {
      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o > max) max = o;
        sums.push(o);
      }
      for (j = 0; j < m; ++j) {
        y0[j] = (max - sums[j]) / 2;
      }
      return y0;
    },
    wiggle: function(data) {
      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
      y0[0] = o = o0 = 0;
      for (j = 1; j < m; ++j) {
        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
          }
          s2 += s3 * data[i][j][1];
        }
        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
        if (o < o0) o0 = o;
      }
      for (j = 0; j < m; ++j) y0[j] -= o0;
      return y0;
    },
    expand: function(data) {
      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
      }
      for (j = 0; j < m; ++j) y0[j] = 0;
      return y0;
    },
    zero: d3_layout_stackOffsetZero
  });
  function d3_layout_stackOrderDefault(data) {
    return d3.range(data.length);
  }
  function d3_layout_stackOffsetZero(data) {
    var j = -1, m = data[0].length, y0 = [];
    while (++j < m) y0[j] = 0;
    return y0;
  }
  function d3_layout_stackMaxIndex(array) {
    var i = 1, j = 0, v = array[0][1], k, n = array.length;
    for (;i < n; ++i) {
      if ((k = array[i][1]) > v) {
        j = i;
        v = k;
      }
    }
    return j;
  }
  function d3_layout_stackReduceSum(d) {
    return d.reduce(d3_layout_stackSum, 0);
  }
  function d3_layout_stackSum(p, d) {
    return p + d[1];
  }
  d3.layout.histogram = function() {
    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
    function histogram(data, i) {
      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
      while (++i < m) {
        bin = bins[i] = [];
        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
        bin.y = 0;
      }
      if (m > 0) {
        i = -1;
        while (++i < n) {
          x = values[i];
          if (x >= range[0] && x <= range[1]) {
            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
            bin.y += k;
            bin.push(data[i]);
          }
        }
      }
      return bins;
    }
    histogram.value = function(x) {
      if (!arguments.length) return valuer;
      valuer = x;
      return histogram;
    };
    histogram.range = function(x) {
      if (!arguments.length) return ranger;
      ranger = d3_functor(x);
      return histogram;
    };
    histogram.bins = function(x) {
      if (!arguments.length) return binner;
      binner = typeof x === "number" ? function(range) {
        return d3_layout_histogramBinFixed(range, x);
      } : d3_functor(x);
      return histogram;
    };
    histogram.frequency = function(x) {
      if (!arguments.length) return frequency;
      frequency = !!x;
      return histogram;
    };
    return histogram;
  };
  function d3_layout_histogramBinSturges(range, values) {
    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
  }
  function d3_layout_histogramBinFixed(range, n) {
    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
    while (++x <= n) f[x] = m * x + b;
    return f;
  }
  function d3_layout_histogramRange(values) {
    return [ d3.min(values), d3.max(values) ];
  }
  d3.layout.tree = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
    function tree(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0];
      function firstWalk(node, previousSibling) {
        var children = node.children, layout = node._tree;
        if (children && (n = children.length)) {
          var n, firstChild = children[0], previousChild, ancestor = firstChild, child, i = -1;
          while (++i < n) {
            child = children[i];
            firstWalk(child, previousChild);
            ancestor = apportion(child, previousChild, ancestor);
            previousChild = child;
          }
          d3_layout_treeShift(node);
          var midpoint = .5 * (firstChild._tree.prelim + child._tree.prelim);
          if (previousSibling) {
            layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
            layout.mod = layout.prelim - midpoint;
          } else {
            layout.prelim = midpoint;
          }
        } else {
          if (previousSibling) {
            layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
          }
        }
      }
      function secondWalk(node, x) {
        node.x = node._tree.prelim + x;
        var children = node.children;
        if (children && (n = children.length)) {
          var i = -1, n;
          x += node._tree.mod;
          while (++i < n) {
            secondWalk(children[i], x);
          }
        }
      }
      function apportion(node, previousSibling, ancestor) {
        if (previousSibling) {
          var vip = node, vop = node, vim = previousSibling, vom = node.parent.children[0], sip = vip._tree.mod, sop = vop._tree.mod, sim = vim._tree.mod, som = vom._tree.mod, shift;
          while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
            vom = d3_layout_treeLeft(vom);
            vop = d3_layout_treeRight(vop);
            vop._tree.ancestor = node;
            shift = vim._tree.prelim + sim - vip._tree.prelim - sip + separation(vim, vip);
            if (shift > 0) {
              d3_layout_treeMove(d3_layout_treeAncestor(vim, node, ancestor), node, shift);
              sip += shift;
              sop += shift;
            }
            sim += vim._tree.mod;
            sip += vip._tree.mod;
            som += vom._tree.mod;
            sop += vop._tree.mod;
          }
          if (vim && !d3_layout_treeRight(vop)) {
            vop._tree.thread = vim;
            vop._tree.mod += sim - sop;
          }
          if (vip && !d3_layout_treeLeft(vom)) {
            vom._tree.thread = vip;
            vom._tree.mod += sip - som;
            ancestor = node;
          }
        }
        return ancestor;
      }
      d3_layout_treeVisitAfter(root, function(node, previousSibling) {
        node._tree = {
          ancestor: node,
          prelim: 0,
          mod: 0,
          change: 0,
          shift: 0,
          number: previousSibling ? previousSibling._tree.number + 1 : 0
        };
      });
      firstWalk(root);
      secondWalk(root, -root._tree.prelim);
      var left = d3_layout_treeSearch(root, d3_layout_treeLeftmost), right = d3_layout_treeSearch(root, d3_layout_treeRightmost), deep = d3_layout_treeSearch(root, d3_layout_treeDeepest), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2, y1 = deep.depth || 1;
      d3_layout_treeVisitAfter(root, nodeSize ? function(node) {
        node.x *= size[0];
        node.y = node.depth * size[1];
        delete node._tree;
      } : function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = node.depth / y1 * size[1];
        delete node._tree;
      });
      return nodes;
    }
    tree.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return tree;
    };
    tree.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null;
      return tree;
    };
    tree.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) != null;
      return tree;
    };
    return d3_layout_hierarchyRebind(tree, hierarchy);
  };
  function d3_layout_treeSeparation(a, b) {
    return a.parent == b.parent ? 1 : 2;
  }
  function d3_layout_treeLeft(node) {
    var children = node.children;
    return children && children.length ? children[0] : node._tree.thread;
  }
  function d3_layout_treeRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? children[n - 1] : node._tree.thread;
  }
  function d3_layout_treeSearch(node, compare) {
    var children = node.children;
    if (children && (n = children.length)) {
      var child, n, i = -1;
      while (++i < n) {
        if (compare(child = d3_layout_treeSearch(children[i], compare), node) > 0) {
          node = child;
        }
      }
    }
    return node;
  }
  function d3_layout_treeRightmost(a, b) {
    return a.x - b.x;
  }
  function d3_layout_treeLeftmost(a, b) {
    return b.x - a.x;
  }
  function d3_layout_treeDeepest(a, b) {
    return a.depth - b.depth;
  }
  function d3_layout_treeVisitAfter(node, callback) {
    function visit(node, previousSibling) {
      var children = node.children;
      if (children && (n = children.length)) {
        var child, previousChild = null, i = -1, n;
        while (++i < n) {
          child = children[i];
          visit(child, previousChild);
          previousChild = child;
        }
      }
      callback(node, previousSibling);
    }
    visit(node, null);
  }
  function d3_layout_treeShift(node) {
    var shift = 0, change = 0, children = node.children, i = children.length, child;
    while (--i >= 0) {
      child = children[i]._tree;
      child.prelim += shift;
      child.mod += shift;
      shift += child.shift + (change += child.change);
    }
  }
  function d3_layout_treeMove(ancestor, node, shift) {
    ancestor = ancestor._tree;
    node = node._tree;
    var change = shift / (node.number - ancestor.number);
    ancestor.change += change;
    node.change -= change;
    node.shift += shift;
    node.prelim += shift;
    node.mod += shift;
  }
  function d3_layout_treeAncestor(vim, node, ancestor) {
    return vim._tree.ancestor.parent == node.parent ? vim._tree.ancestor : ancestor;
  }
  d3.layout.pack = function() {
    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
    function pack(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
        return radius;
      };
      root.x = root.y = 0;
      d3_layout_treeVisitAfter(root, function(d) {
        d.r = +r(d.value);
      });
      d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
      if (padding) {
        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
        d3_layout_treeVisitAfter(root, function(d) {
          d.r += dr;
        });
        d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
        d3_layout_treeVisitAfter(root, function(d) {
          d.r -= dr;
        });
      }
      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
      return nodes;
    }
    pack.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return pack;
    };
    pack.radius = function(_) {
      if (!arguments.length) return radius;
      radius = _ == null || typeof _ === "function" ? _ : +_;
      return pack;
    };
    pack.padding = function(_) {
      if (!arguments.length) return padding;
      padding = +_;
      return pack;
    };
    return d3_layout_hierarchyRebind(pack, hierarchy);
  };
  function d3_layout_packSort(a, b) {
    return a.value - b.value;
  }
  function d3_layout_packInsert(a, b) {
    var c = a._pack_next;
    a._pack_next = b;
    b._pack_prev = a;
    b._pack_next = c;
    c._pack_prev = b;
  }
  function d3_layout_packSplice(a, b) {
    a._pack_next = b;
    b._pack_prev = a;
  }
  function d3_layout_packIntersects(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
    return .999 * dr * dr > dx * dx + dy * dy;
  }
  function d3_layout_packSiblings(node) {
    if (!(nodes = node.children) || !(n = nodes.length)) return;
    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
    function bound(node) {
      xMin = Math.min(node.x - node.r, xMin);
      xMax = Math.max(node.x + node.r, xMax);
      yMin = Math.min(node.y - node.r, yMin);
      yMax = Math.max(node.y + node.r, yMax);
    }
    nodes.forEach(d3_layout_packLink);
    a = nodes[0];
    a.x = -a.r;
    a.y = 0;
    bound(a);
    if (n > 1) {
      b = nodes[1];
      b.x = b.r;
      b.y = 0;
      bound(b);
      if (n > 2) {
        c = nodes[2];
        d3_layout_packPlace(a, b, c);
        bound(c);
        d3_layout_packInsert(a, c);
        a._pack_prev = c;
        d3_layout_packInsert(c, b);
        b = a._pack_next;
        for (i = 3; i < n; i++) {
          d3_layout_packPlace(a, b, c = nodes[i]);
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
            if (d3_layout_packIntersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
              if (d3_layout_packIntersects(k, c)) {
                break;
              }
            }
          }
          if (isect) {
            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
            i--;
          } else {
            d3_layout_packInsert(a, c);
            b = c;
            bound(c);
          }
        }
      }
    }
    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
    for (i = 0; i < n; i++) {
      c = nodes[i];
      c.x -= cx;
      c.y -= cy;
      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
    }
    node.r = cr;
    nodes.forEach(d3_layout_packUnlink);
  }
  function d3_layout_packLink(node) {
    node._pack_next = node._pack_prev = node;
  }
  function d3_layout_packUnlink(node) {
    delete node._pack_next;
    delete node._pack_prev;
  }
  function d3_layout_packTransform(node, x, y, k) {
    var children = node.children;
    node.x = x += k * node.x;
    node.y = y += k * node.y;
    node.r *= k;
    if (children) {
      var i = -1, n = children.length;
      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
    }
  }
  function d3_layout_packPlace(a, b, c) {
    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
    if (db && (dx || dy)) {
      var da = b.r + c.r, dc = dx * dx + dy * dy;
      da *= da;
      db *= db;
      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
      c.x = a.x + x * dx + y * dy;
      c.y = a.y + x * dy - y * dx;
    } else {
      c.x = a.x + db;
      c.y = a.y;
    }
  }
  d3.layout.cluster = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
    function cluster(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
      d3_layout_treeVisitAfter(root, function(node) {
        var children = node.children;
        if (children && children.length) {
          node.x = d3_layout_clusterX(children);
          node.y = d3_layout_clusterY(children);
        } else {
          node.x = previousNode ? x += separation(node, previousNode) : 0;
          node.y = 0;
          previousNode = node;
        }
      });
      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
      d3_layout_treeVisitAfter(root, nodeSize ? function(node) {
        node.x = (node.x - root.x) * size[0];
        node.y = (root.y - node.y) * size[1];
      } : function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
      });
      return nodes;
    }
    cluster.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return cluster;
    };
    cluster.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null;
      return cluster;
    };
    cluster.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) != null;
      return cluster;
    };
    return d3_layout_hierarchyRebind(cluster, hierarchy);
  };
  function d3_layout_clusterY(children) {
    return 1 + d3.max(children, function(child) {
      return child.y;
    });
  }
  function d3_layout_clusterX(children) {
    return children.reduce(function(x, child) {
      return x + child.x;
    }, 0) / children.length;
  }
  function d3_layout_clusterLeft(node) {
    var children = node.children;
    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
  }
  function d3_layout_clusterRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
  }
  d3.layout.treemap = function() {
    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
    function scale(children, k) {
      var i = -1, n = children.length, child, area;
      while (++i < n) {
        area = (child = children[i]).value * (k < 0 ? 0 : k);
        child.area = isNaN(area) || area <= 0 ? 0 : area;
      }
    }
    function squarify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while ((n = remaining.length) > 0) {
          row.push(child = remaining[n - 1]);
          row.area += child.area;
          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
            remaining.pop();
            best = score;
          } else {
            row.area -= row.pop().area;
            position(row, u, rect, false);
            u = Math.min(rect.dx, rect.dy);
            row.length = row.area = 0;
            best = Infinity;
          }
        }
        if (row.length) {
          position(row, u, rect, true);
          row.length = row.area = 0;
        }
        children.forEach(squarify);
      }
    }
    function stickify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), remaining = children.slice(), child, row = [];
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while (child = remaining.pop()) {
          row.push(child);
          row.area += child.area;
          if (child.z != null) {
            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
            row.length = row.area = 0;
          }
        }
        children.forEach(stickify);
      }
    }
    function worst(row, u) {
      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
      while (++i < n) {
        if (!(r = row[i].area)) continue;
        if (r < rmin) rmin = r;
        if (r > rmax) rmax = r;
      }
      s *= s;
      u *= u;
      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
    }
    function position(row, u, rect, flush) {
      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
      if (u == rect.dx) {
        if (flush || v > rect.dy) v = rect.dy;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dy = v;
          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
        }
        o.z = true;
        o.dx += rect.x + rect.dx - x;
        rect.y += v;
        rect.dy -= v;
      } else {
        if (flush || v > rect.dx) v = rect.dx;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dx = v;
          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
        }
        o.z = false;
        o.dy += rect.y + rect.dy - y;
        rect.x += v;
        rect.dx -= v;
      }
    }
    function treemap(d) {
      var nodes = stickies || hierarchy(d), root = nodes[0];
      root.x = 0;
      root.y = 0;
      root.dx = size[0];
      root.dy = size[1];
      if (stickies) hierarchy.revalue(root);
      scale([ root ], root.dx * root.dy / root.value);
      (stickies ? stickify : squarify)(root);
      if (sticky) stickies = nodes;
      return nodes;
    }
    treemap.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return treemap;
    };
    treemap.padding = function(x) {
      if (!arguments.length) return padding;
      function padFunction(node) {
        var p = x.call(treemap, node, node.depth);
        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
      }
      function padConstant(node) {
        return d3_layout_treemapPad(node, x);
      }
      var type;
      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
      padConstant) : padConstant;
      return treemap;
    };
    treemap.round = function(x) {
      if (!arguments.length) return round != Number;
      round = x ? Math.round : Number;
      return treemap;
    };
    treemap.sticky = function(x) {
      if (!arguments.length) return sticky;
      sticky = x;
      stickies = null;
      return treemap;
    };
    treemap.ratio = function(x) {
      if (!arguments.length) return ratio;
      ratio = x;
      return treemap;
    };
    treemap.mode = function(x) {
      if (!arguments.length) return mode;
      mode = x + "";
      return treemap;
    };
    return d3_layout_hierarchyRebind(treemap, hierarchy);
  };
  function d3_layout_treemapPadNull(node) {
    return {
      x: node.x,
      y: node.y,
      dx: node.dx,
      dy: node.dy
    };
  }
  function d3_layout_treemapPad(node, padding) {
    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
    if (dx < 0) {
      x += dx / 2;
      dx = 0;
    }
    if (dy < 0) {
      y += dy / 2;
      dy = 0;
    }
    return {
      x: x,
      y: y,
      dx: dx,
      dy: dy
    };
  }
  d3.random = {
    normal: function(µ, σ) {
      var n = arguments.length;
      if (n < 2) σ = 1;
      if (n < 1) µ = 0;
      return function() {
        var x, y, r;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
      };
    },
    logNormal: function() {
      var random = d3.random.normal.apply(d3, arguments);
      return function() {
        return Math.exp(random());
      };
    },
    bates: function(m) {
      var random = d3.random.irwinHall(m);
      return function() {
        return random() / m;
      };
    },
    irwinHall: function(m) {
      return function() {
        for (var s = 0, j = 0; j < m; j++) s += Math.random();
        return s;
      };
    }
  };
  d3.scale = {};
  function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
  }
  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }
  function d3_scale_nice(domain, nice) {
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
    if (x1 < x0) {
      dx = i0, i0 = i1, i1 = dx;
      dx = x0, x0 = x1, x1 = dx;
    }
    domain[i0] = nice.floor(x0);
    domain[i1] = nice.ceil(x1);
    return domain;
  }
  function d3_scale_niceStep(step) {
    return step ? {
      floor: function(x) {
        return Math.floor(x / step) * step;
      },
      ceil: function(x) {
        return Math.ceil(x / step) * step;
      }
    } : d3_scale_niceIdentity;
  }
  var d3_scale_niceIdentity = {
    floor: d3_identity,
    ceil: d3_identity
  };
  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
    if (domain[k] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++j <= k) {
      u.push(uninterpolate(domain[j - 1], domain[j]));
      i.push(interpolate(range[j - 1], range[j]));
    }
    return function(x) {
      var j = d3.bisect(domain, x, 1, k) - 1;
      return i[j](u[j](x));
    };
  }
  d3.scale.linear = function() {
    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
  };
  function d3_scale_linear(domain, range, interpolate, clamp) {
    var output, input;
    function rescale() {
      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, d3_interpolate);
      return scale;
    }
    function scale(x) {
      return output(x);
    }
    scale.invert = function(y) {
      return input(y);
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(Number);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(d3_interpolateRound);
    };
    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };
    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      d3_scale_linearNice(domain, m);
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_linear(domain, range, interpolate, clamp);
    };
    return rescale();
  }
  function d3_scale_linearRebind(scale, linear) {
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_scale_linearNice(domain, m) {
    return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
  }
  function d3_scale_linearTickRange(domain, m) {
    if (m == null) m = 10;
    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
    extent[2] = step;
    return extent;
  }
  function d3_scale_linearTicks(domain, m) {
    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
  }
  function d3_scale_linearTickFormat(domain, m, format) {
    var range = d3_scale_linearTickRange(domain, m);
    return d3.format(format ? format.replace(d3_format_re, function(a, b, c, d, e, f, g, h, i, j) {
      return [ b, c, d, e, f, g, h, i || "." + d3_scale_linearFormatPrecision(j, range), j ].join("");
    }) : ",." + d3_scale_linearPrecision(range[2]) + "f");
  }
  var d3_scale_linearFormatSignificant = {
    s: 1,
    g: 1,
    p: 1,
    r: 1,
    e: 1
  };
  function d3_scale_linearPrecision(value) {
    return -Math.floor(Math.log(value) / Math.LN10 + .01);
  }
  function d3_scale_linearFormatPrecision(type, range) {
    var p = d3_scale_linearPrecision(range[2]);
    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(Math.abs(range[0]), Math.abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
  }
  d3.scale.log = function() {
    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
  };
  function d3_scale_log(linear, base, positive, domain) {
    function log(x) {
      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
    }
    function pow(x) {
      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
    }
    function scale(x) {
      return linear(log(x));
    }
    scale.invert = function(x) {
      return pow(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      positive = x[0] >= 0;
      linear.domain((domain = x.map(Number)).map(log));
      return scale;
    };
    scale.base = function(_) {
      if (!arguments.length) return base;
      base = +_;
      linear.domain(domain.map(log));
      return scale;
    };
    scale.nice = function() {
      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
      linear.domain(niced);
      domain = niced.map(pow);
      return scale;
    };
    scale.ticks = function() {
      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
      if (isFinite(j - i)) {
        if (positive) {
          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
          ticks.push(pow(i));
        } else {
          ticks.push(pow(i));
          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
        }
        for (i = 0; ticks[i] < u; i++) {}
        for (j = ticks.length; ticks[j - 1] > v; j--) {}
        ticks = ticks.slice(i, j);
      }
      return ticks;
    };
    scale.tickFormat = function(n, format) {
      if (!arguments.length) return d3_scale_logFormat;
      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
      var k = Math.max(.1, n / scale.ticks().length), f = positive ? (e = 1e-12, Math.ceil) : (e = -1e-12, 
      Math.floor), e;
      return function(d) {
        return d / pow(f(log(d) + e)) <= k ? format(d) : "";
      };
    };
    scale.copy = function() {
      return d3_scale_log(linear.copy(), base, positive, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
    floor: function(x) {
      return -Math.ceil(-x);
    },
    ceil: function(x) {
      return -Math.floor(-x);
    }
  };
  d3.scale.pow = function() {
    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
  };
  function d3_scale_pow(linear, exponent, domain) {
    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
    function scale(x) {
      return linear(powp(x));
    }
    scale.invert = function(x) {
      return powb(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      linear.domain((domain = x.map(Number)).map(powp));
      return scale;
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      return scale.domain(d3_scale_linearNice(domain, m));
    };
    scale.exponent = function(x) {
      if (!arguments.length) return exponent;
      powp = d3_scale_powPow(exponent = x);
      powb = d3_scale_powPow(1 / exponent);
      linear.domain(domain.map(powp));
      return scale;
    };
    scale.copy = function() {
      return d3_scale_pow(linear.copy(), exponent, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_scale_powPow(e) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
    };
  }
  d3.scale.sqrt = function() {
    return d3.scale.pow().exponent(.5);
  };
  d3.scale.ordinal = function() {
    return d3_scale_ordinal([], {
      t: "range",
      a: [ [] ]
    });
  };
  function d3_scale_ordinal(domain, ranger) {
    var index, range, rangeBand;
    function scale(x) {
      return range[((index.get(x) || ranger.t === "range" && index.set(x, domain.push(x))) - 1) % range.length];
    }
    function steps(start, step) {
      return d3.range(domain.length).map(function(i) {
        return start + step * i;
      });
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      index = new d3_Map();
      var i = -1, n = x.length, xi;
      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
      return scale[ranger.t].apply(scale, ranger.a);
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      rangeBand = 0;
      ranger = {
        t: "range",
        a: arguments
      };
      return scale;
    };
    scale.rangePoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
      range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
      rangeBand = 0;
      ranger = {
        t: "rangePoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
      range = steps(start + step * outerPadding, step);
      if (reverse) range.reverse();
      rangeBand = step * (1 - padding);
      ranger = {
        t: "rangeBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)), error = stop - start - (domain.length - padding) * step;
      range = steps(start + Math.round(error / 2), step);
      if (reverse) range.reverse();
      rangeBand = Math.round(step * (1 - padding));
      ranger = {
        t: "rangeRoundBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeBand = function() {
      return rangeBand;
    };
    scale.rangeExtent = function() {
      return d3_scaleExtent(ranger.a[0]);
    };
    scale.copy = function() {
      return d3_scale_ordinal(domain, ranger);
    };
    return scale.domain(domain);
  }
  d3.scale.category10 = function() {
    return d3.scale.ordinal().range(d3_category10);
  };
  d3.scale.category20 = function() {
    return d3.scale.ordinal().range(d3_category20);
  };
  d3.scale.category20b = function() {
    return d3.scale.ordinal().range(d3_category20b);
  };
  d3.scale.category20c = function() {
    return d3.scale.ordinal().range(d3_category20c);
  };
  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
  d3.scale.quantile = function() {
    return d3_scale_quantile([], []);
  };
  function d3_scale_quantile(domain, range) {
    var thresholds;
    function rescale() {
      var k = 0, q = range.length;
      thresholds = [];
      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
      return scale;
    }
    function scale(x) {
      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.filter(function(d) {
        return !isNaN(d);
      }).sort(d3.ascending);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.quantiles = function() {
      return thresholds;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
    };
    scale.copy = function() {
      return d3_scale_quantile(domain, range);
    };
    return rescale();
  }
  d3.scale.quantize = function() {
    return d3_scale_quantize(0, 1, [ 0, 1 ]);
  };
  function d3_scale_quantize(x0, x1, range) {
    var kx, i;
    function scale(x) {
      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
    }
    function rescale() {
      kx = range.length / (x1 - x0);
      i = range.length - 1;
      return scale;
    }
    scale.domain = function(x) {
      if (!arguments.length) return [ x0, x1 ];
      x0 = +x[0];
      x1 = +x[x.length - 1];
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      y = y < 0 ? NaN : y / kx + x0;
      return [ y, y + 1 / kx ];
    };
    scale.copy = function() {
      return d3_scale_quantize(x0, x1, range);
    };
    return rescale();
  }
  d3.scale.threshold = function() {
    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
  };
  function d3_scale_threshold(domain, range) {
    function scale(x) {
      if (x <= x) return range[d3.bisect(domain, x)];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain;
      domain = _;
      return scale;
    };
    scale.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return scale;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return [ domain[y - 1], domain[y] ];
    };
    scale.copy = function() {
      return d3_scale_threshold(domain, range);
    };
    return scale;
  }
  d3.scale.identity = function() {
    return d3_scale_identity([ 0, 1 ]);
  };
  function d3_scale_identity(domain) {
    function identity(x) {
      return +x;
    }
    identity.invert = identity;
    identity.domain = identity.range = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(identity);
      return identity;
    };
    identity.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    identity.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    identity.copy = function() {
      return d3_scale_identity(domain);
    };
    return identity;
  }
  d3.svg = {};
  d3.svg.arc = function() {
    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function arc() {
      var r0 = innerRadius.apply(this, arguments), r1 = outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) + d3_svg_arcOffset, a1 = endAngle.apply(this, arguments) + d3_svg_arcOffset, da = (a1 < a0 && (da = a0, 
      a0 = a1, a1 = da), a1 - a0), df = da < π ? "0" : "1", c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      return da >= d3_svg_arcMax ? r0 ? "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "M0," + r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + -r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + r0 + "Z" : "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "Z" : r0 ? "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L" + r0 * c1 + "," + r0 * s1 + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0 + "Z" : "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L0,0" + "Z";
    }
    arc.innerRadius = function(v) {
      if (!arguments.length) return innerRadius;
      innerRadius = d3_functor(v);
      return arc;
    };
    arc.outerRadius = function(v) {
      if (!arguments.length) return outerRadius;
      outerRadius = d3_functor(v);
      return arc;
    };
    arc.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return arc;
    };
    arc.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return arc;
    };
    arc.centroid = function() {
      var r = (innerRadius.apply(this, arguments) + outerRadius.apply(this, arguments)) / 2, a = (startAngle.apply(this, arguments) + endAngle.apply(this, arguments)) / 2 + d3_svg_arcOffset;
      return [ Math.cos(a) * r, Math.sin(a) * r ];
    };
    return arc;
  };
  var d3_svg_arcOffset = -halfπ, d3_svg_arcMax = τ - ε;
  function d3_svg_arcInnerRadius(d) {
    return d.innerRadius;
  }
  function d3_svg_arcOuterRadius(d) {
    return d.outerRadius;
  }
  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }
  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }
  function d3_svg_line(projection) {
    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
    function line(data) {
      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
      function segment() {
        segments.push("M", interpolate(projection(points), tension));
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
        } else if (points.length) {
          segment();
          points = [];
        }
      }
      if (points.length) segment();
      return segments.length ? segments.join("") : null;
    }
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
  }
  d3.svg.line = function() {
    return d3_svg_line(d3_identity);
  };
  var d3_svg_lineInterpolators = d3.map({
    linear: d3_svg_lineLinear,
    "linear-closed": d3_svg_lineLinearClosed,
    step: d3_svg_lineStep,
    "step-before": d3_svg_lineStepBefore,
    "step-after": d3_svg_lineStepAfter,
    basis: d3_svg_lineBasis,
    "basis-open": d3_svg_lineBasisOpen,
    "basis-closed": d3_svg_lineBasisClosed,
    bundle: d3_svg_lineBundle,
    cardinal: d3_svg_lineCardinal,
    "cardinal-open": d3_svg_lineCardinalOpen,
    "cardinal-closed": d3_svg_lineCardinalClosed,
    monotone: d3_svg_lineMonotone
  });
  d3_svg_lineInterpolators.forEach(function(key, value) {
    value.key = key;
    value.closed = /-closed$/.test(key);
  });
  function d3_svg_lineLinear(points) {
    return points.join("L");
  }
  function d3_svg_lineLinearClosed(points) {
    return d3_svg_lineLinear(points) + "Z";
  }
  function d3_svg_lineStep(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
    if (n > 1) path.push("H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepBefore(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepAfter(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
    return path.join("");
  }
  function d3_svg_lineCardinalOpen(points, tension) {
    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1), d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineCardinalClosed(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
  }
  function d3_svg_lineCardinal(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineHermite(points, tangents) {
    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
      return d3_svg_lineLinear(points);
    }
    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
    if (quad) {
      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
      p0 = points[1];
      pi = 2;
    }
    if (tangents.length > 1) {
      t = tangents[1];
      p = points[pi];
      pi++;
      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      for (var i = 2; i < tangents.length; i++, pi++) {
        p = points[pi];
        t = tangents[i];
        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      }
    }
    if (quad) {
      var lp = points[pi];
      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }
    return path;
  }
  function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
    while (++i < n) {
      p0 = p1;
      p1 = p2;
      p2 = points[i];
      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
    }
    return tangents;
  }
  function d3_svg_lineBasis(points) {
    if (points.length < 3) return d3_svg_lineLinear(points);
    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    points.push(points[n - 1]);
    while (++i <= n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    points.pop();
    path.push("L", pi);
    return path.join("");
  }
  function d3_svg_lineBasisOpen(points) {
    if (points.length < 4) return d3_svg_lineLinear(points);
    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
    while (++i < 3) {
      pi = points[i];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
    --i;
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisClosed(points) {
    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
    while (++i < 4) {
      pi = points[i % n];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    --i;
    while (++i < m) {
      pi = points[i % n];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBundle(points, tension) {
    var n = points.length - 1;
    if (n) {
      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
      while (++i <= n) {
        p = points[i];
        t = i / n;
        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
      }
    }
    return d3_svg_lineBasis(points);
  }
  function d3_svg_lineDot4(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
  function d3_svg_lineBasisBezier(path, x, y) {
    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
  }
  function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
  }
  function d3_svg_lineFiniteDifferences(points) {
    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
  }
  function d3_svg_lineMonotoneTangents(points) {
    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
    while (++i < j) {
      d = d3_svg_lineSlope(points[i], points[i + 1]);
      if (abs(d) < ε) {
        m[i] = m[i + 1] = 0;
      } else {
        a = m[i] / d;
        b = m[i + 1] / d;
        s = a * a + b * b;
        if (s > 9) {
          s = d * 3 / Math.sqrt(s);
          m[i] = s * a;
          m[i + 1] = s * b;
        }
      }
    }
    i = -1;
    while (++i <= j) {
      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
      tangents.push([ s || 0, m[i] * s || 0 ]);
    }
    return tangents;
  }
  function d3_svg_lineMonotone(points) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
  }
  d3.svg.line.radial = function() {
    var line = d3_svg_line(d3_svg_lineRadial);
    line.radius = line.x, delete line.x;
    line.angle = line.y, delete line.y;
    return line;
  };
  function d3_svg_lineRadial(points) {
    var point, i = -1, n = points.length, r, a;
    while (++i < n) {
      point = points[i];
      r = point[0];
      a = point[1] + d3_svg_arcOffset;
      point[0] = r * Math.cos(a);
      point[1] = r * Math.sin(a);
    }
    return points;
  }
  function d3_svg_area(projection) {
    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
    function area(data) {
      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
        return x;
      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
        return y;
      } : d3_functor(y1), x, y;
      function segment() {
        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
        } else if (points0.length) {
          segment();
          points0 = [];
          points1 = [];
        }
      }
      if (points0.length) segment();
      return segments.length ? segments.join("") : null;
    }
    area.x = function(_) {
      if (!arguments.length) return x1;
      x0 = x1 = _;
      return area;
    };
    area.x0 = function(_) {
      if (!arguments.length) return x0;
      x0 = _;
      return area;
    };
    area.x1 = function(_) {
      if (!arguments.length) return x1;
      x1 = _;
      return area;
    };
    area.y = function(_) {
      if (!arguments.length) return y1;
      y0 = y1 = _;
      return area;
    };
    area.y0 = function(_) {
      if (!arguments.length) return y0;
      y0 = _;
      return area;
    };
    area.y1 = function(_) {
      if (!arguments.length) return y1;
      y1 = _;
      return area;
    };
    area.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return area;
    };
    area.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      interpolateReverse = interpolate.reverse || interpolate;
      L = interpolate.closed ? "M" : "L";
      return area;
    };
    area.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return area;
    };
    return area;
  }
  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
  d3.svg.area = function() {
    return d3_svg_area(d3_identity);
  };
  d3.svg.area.radial = function() {
    var area = d3_svg_area(d3_svg_lineRadial);
    area.radius = area.x, delete area.x;
    area.innerRadius = area.x0, delete area.x0;
    area.outerRadius = area.x1, delete area.x1;
    area.angle = area.y, delete area.y;
    area.startAngle = area.y0, delete area.y0;
    area.endAngle = area.y1, delete area.y1;
    return area;
  };
  d3.svg.chord = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
    }
    function subgroup(self, f, d, i) {
      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset, a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
      return {
        r: r,
        a0: a0,
        a1: a1,
        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
      };
    }
    function equals(a, b) {
      return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
    }
    function curve(r0, p0, r1, p1) {
      return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
    return chord;
  };
  function d3_svg_chordRadius(d) {
    return d.radius;
  }
  d3.svg.diagonal = function() {
    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
    function diagonal(d, i) {
      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
        x: p0.x,
        y: m
      }, {
        x: p3.x,
        y: m
      }, p3 ];
      p = p.map(projection);
      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
    }
    diagonal.source = function(x) {
      if (!arguments.length) return source;
      source = d3_functor(x);
      return diagonal;
    };
    diagonal.target = function(x) {
      if (!arguments.length) return target;
      target = d3_functor(x);
      return diagonal;
    };
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    return diagonal;
  };
  function d3_svg_diagonalProjection(d) {
    return [ d.x, d.y ];
  }
  d3.svg.diagonal.radial = function() {
    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
    diagonal.projection = function(x) {
      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
    };
    return diagonal;
  };
  function d3_svg_diagonalRadialProjection(projection) {
    return function() {
      var d = projection.apply(this, arguments), r = d[0], a = d[1] + d3_svg_arcOffset;
      return [ r * Math.cos(a), r * Math.sin(a) ];
    };
  }
  d3.svg.symbol = function() {
    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
    function symbol(d, i) {
      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
    }
    symbol.type = function(x) {
      if (!arguments.length) return type;
      type = d3_functor(x);
      return symbol;
    };
    symbol.size = function(x) {
      if (!arguments.length) return size;
      size = d3_functor(x);
      return symbol;
    };
    return symbol;
  };
  function d3_svg_symbolSize() {
    return 64;
  }
  function d3_svg_symbolType() {
    return "circle";
  }
  function d3_svg_symbolCircle(size) {
    var r = Math.sqrt(size / π);
    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
  }
  var d3_svg_symbols = d3.map({
    circle: d3_svg_symbolCircle,
    cross: function(size) {
      var r = Math.sqrt(size / 5) / 2;
      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
    },
    diamond: function(size) {
      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
    },
    square: function(size) {
      var r = Math.sqrt(size) / 2;
      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
    },
    "triangle-down": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
    },
    "triangle-up": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
    }
  });
  d3.svg.symbolTypes = d3_svg_symbols.keys();
  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
  function d3_transition(groups, id) {
    d3_subclass(groups, d3_transitionPrototype);
    groups.id = id;
    return groups;
  }
  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
  d3_transitionPrototype.call = d3_selectionPrototype.call;
  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
  d3_transitionPrototype.node = d3_selectionPrototype.node;
  d3_transitionPrototype.size = d3_selectionPrototype.size;
  d3.transition = function(selection) {
    return arguments.length ? d3_transitionInheritId ? selection.transition() : selection : d3_selectionRoot.transition();
  };
  d3.transition.prototype = d3_transitionPrototype;
  d3_transitionPrototype.select = function(selector) {
    var id = this.id, subgroups = [], subgroup, subnode, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          d3_transitionNode(subnode, i, id, node.__transition__[id]);
          subgroup.push(subnode);
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_transitionPrototype.selectAll = function(selector) {
    var id = this.id, subgroups = [], subgroup, subnodes, node, subnode, transition;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          transition = node.__transition__[id];
          subnodes = selector.call(node, node.__data__, i, j);
          subgroups.push(subgroup = []);
          for (var k = -1, o = subnodes.length; ++k < o; ) {
            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, id, transition);
            subgroup.push(subnode);
          }
        }
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_transitionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_transition(subgroups, this.id);
  };
  d3_transitionPrototype.tween = function(name, tween) {
    var id = this.id;
    if (arguments.length < 2) return this.node().__transition__[id].tween.get(name);
    return d3_selection_each(this, tween == null ? function(node) {
      node.__transition__[id].tween.remove(name);
    } : function(node) {
      node.__transition__[id].tween.set(name, tween);
    });
  };
  function d3_transition_tween(groups, name, value, tween) {
    var id = groups.id;
    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
    } : (value = tween(value), function(node) {
      node.__transition__[id].tween.set(name, value);
    }));
  }
  d3_transitionPrototype.attr = function(nameNS, value) {
    if (arguments.length < 2) {
      for (value in nameNS) this.attr(value, nameNS[value]);
      return this;
    }
    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrTween(b) {
      return b == null ? attrNull : (b += "", function() {
        var a = this.getAttribute(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttribute(name, i(t));
        });
      });
    }
    function attrTweenNS(b) {
      return b == null ? attrNullNS : (b += "", function() {
        var a = this.getAttributeNS(name.space, name.local), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttributeNS(name.space, name.local, i(t));
        });
      });
    }
    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.attrTween = function(nameNS, tween) {
    var name = d3.ns.qualify(nameNS);
    function attrTween(d, i) {
      var f = tween.call(this, d, i, this.getAttribute(name));
      return f && function(t) {
        this.setAttribute(name, f(t));
      };
    }
    function attrTweenNS(d, i) {
      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
      return f && function(t) {
        this.setAttributeNS(name.space, name.local, f(t));
      };
    }
    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.style(priority, name[priority], value);
        return this;
      }
      priority = "";
    }
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleString(b) {
      return b == null ? styleNull : (b += "", function() {
        var a = d3_window.getComputedStyle(this, null).getPropertyValue(name), i;
        return a !== b && (i = d3_interpolate(a, b), function(t) {
          this.style.setProperty(name, i(t), priority);
        });
      });
    }
    return d3_transition_tween(this, "style." + name, value, styleString);
  };
  d3_transitionPrototype.styleTween = function(name, tween, priority) {
    if (arguments.length < 3) priority = "";
    function styleTween(d, i) {
      var f = tween.call(this, d, i, d3_window.getComputedStyle(this, null).getPropertyValue(name));
      return f && function(t) {
        this.style.setProperty(name, f(t), priority);
      };
    }
    return this.tween("style." + name, styleTween);
  };
  d3_transitionPrototype.text = function(value) {
    return d3_transition_tween(this, "text", value, d3_transition_text);
  };
  function d3_transition_text(b) {
    if (b == null) b = "";
    return function() {
      this.textContent = b;
    };
  }
  d3_transitionPrototype.remove = function() {
    return this.each("end.transition", function() {
      var p;
      if (this.__transition__.count < 2 && (p = this.parentNode)) p.removeChild(this);
    });
  };
  d3_transitionPrototype.ease = function(value) {
    var id = this.id;
    if (arguments.length < 1) return this.node().__transition__[id].ease;
    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
    return d3_selection_each(this, function(node) {
      node.__transition__[id].ease = value;
    });
  };
  d3_transitionPrototype.delay = function(value) {
    var id = this.id;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].delay = +value.call(node, node.__data__, i, j);
    } : (value = +value, function(node) {
      node.__transition__[id].delay = value;
    }));
  };
  d3_transitionPrototype.duration = function(value) {
    var id = this.id;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].duration = Math.max(1, value.call(node, node.__data__, i, j));
    } : (value = Math.max(1, value), function(node) {
      node.__transition__[id].duration = value;
    }));
  };
  d3_transitionPrototype.each = function(type, listener) {
    var id = this.id;
    if (arguments.length < 2) {
      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
      d3_transitionInheritId = id;
      d3_selection_each(this, function(node, i, j) {
        d3_transitionInherit = node.__transition__[id];
        type.call(node, node.__data__, i, j);
      });
      d3_transitionInherit = inherit;
      d3_transitionInheritId = inheritId;
    } else {
      d3_selection_each(this, function(node) {
        var transition = node.__transition__[id];
        (transition.event || (transition.event = d3.dispatch("start", "end"))).on(type, listener);
      });
    }
    return this;
  };
  d3_transitionPrototype.transition = function() {
    var id0 = this.id, id1 = ++d3_transitionId, subgroups = [], subgroup, group, node, transition;
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if (node = group[i]) {
          transition = Object.create(node.__transition__[id0]);
          transition.delay += transition.duration;
          d3_transitionNode(node, i, id1, transition);
        }
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, id1);
  };
  function d3_transitionNode(node, i, id, inherit) {
    var lock = node.__transition__ || (node.__transition__ = {
      active: 0,
      count: 0
    }), transition = lock[id];
    if (!transition) {
      var time = inherit.time;
      transition = lock[id] = {
        tween: new d3_Map(),
        time: time,
        ease: inherit.ease,
        delay: inherit.delay,
        duration: inherit.duration
      };
      ++lock.count;
      d3.timer(function(elapsed) {
        var d = node.__data__, ease = transition.ease, delay = transition.delay, duration = transition.duration, timer = d3_timer_active, tweened = [];
        timer.t = delay + time;
        if (delay <= elapsed) return start(elapsed - delay);
        timer.c = start;
        function start(elapsed) {
          if (lock.active > id) return stop();
          lock.active = id;
          transition.event && transition.event.start.call(node, d, i);
          transition.tween.forEach(function(key, value) {
            if (value = value.call(node, d, i)) {
              tweened.push(value);
            }
          });
          d3.timer(function() {
            timer.c = tick(elapsed || 1) ? d3_true : tick;
            return 1;
          }, 0, time);
        }
        function tick(elapsed) {
          if (lock.active !== id) return stop();
          var t = elapsed / duration, e = ease(t), n = tweened.length;
          while (n > 0) {
            tweened[--n].call(node, e);
          }
          if (t >= 1) {
            transition.event && transition.event.end.call(node, d, i);
            return stop();
          }
        }
        function stop() {
          if (--lock.count) delete lock[id]; else delete node.__transition__;
          return 1;
        }
      }, 0, time);
    }
  }
  d3.svg.axis = function() {
    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
    function axis(g) {
      g.each(function() {
        var g = d3.select(this);
        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε), tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(), tickUpdate = d3.transition(tick).style("opacity", 1), tickTransform;
        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
        d3.transition(path));
        tickEnter.append("line");
        tickEnter.append("text");
        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text");
        switch (orient) {
         case "bottom":
          {
            tickTransform = d3_svg_axisX;
            lineEnter.attr("y2", innerTickSize);
            textEnter.attr("y", Math.max(innerTickSize, 0) + tickPadding);
            lineUpdate.attr("x2", 0).attr("y2", innerTickSize);
            textUpdate.attr("x", 0).attr("y", Math.max(innerTickSize, 0) + tickPadding);
            text.attr("dy", ".71em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + outerTickSize + "V0H" + range[1] + "V" + outerTickSize);
            break;
          }

         case "top":
          {
            tickTransform = d3_svg_axisX;
            lineEnter.attr("y2", -innerTickSize);
            textEnter.attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
            lineUpdate.attr("x2", 0).attr("y2", -innerTickSize);
            textUpdate.attr("x", 0).attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
            text.attr("dy", "0em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + -outerTickSize + "V0H" + range[1] + "V" + -outerTickSize);
            break;
          }

         case "left":
          {
            tickTransform = d3_svg_axisY;
            lineEnter.attr("x2", -innerTickSize);
            textEnter.attr("x", -(Math.max(innerTickSize, 0) + tickPadding));
            lineUpdate.attr("x2", -innerTickSize).attr("y2", 0);
            textUpdate.attr("x", -(Math.max(innerTickSize, 0) + tickPadding)).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "end");
            pathUpdate.attr("d", "M" + -outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + -outerTickSize);
            break;
          }

         case "right":
          {
            tickTransform = d3_svg_axisY;
            lineEnter.attr("x2", innerTickSize);
            textEnter.attr("x", Math.max(innerTickSize, 0) + tickPadding);
            lineUpdate.attr("x2", innerTickSize).attr("y2", 0);
            textUpdate.attr("x", Math.max(innerTickSize, 0) + tickPadding).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "start");
            pathUpdate.attr("d", "M" + outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + outerTickSize);
            break;
          }
        }
        if (scale1.rangeBand) {
          var x = scale1, dx = x.rangeBand() / 2;
          scale0 = scale1 = function(d) {
            return x(d) + dx;
          };
        } else if (scale0.rangeBand) {
          scale0 = scale1;
        } else {
          tickExit.call(tickTransform, scale1);
        }
        tickEnter.call(tickTransform, scale0);
        tickUpdate.call(tickTransform, scale1);
      });
    }
    axis.scale = function(x) {
      if (!arguments.length) return scale;
      scale = x;
      return axis;
    };
    axis.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
      return axis;
    };
    axis.ticks = function() {
      if (!arguments.length) return tickArguments_;
      tickArguments_ = arguments;
      return axis;
    };
    axis.tickValues = function(x) {
      if (!arguments.length) return tickValues;
      tickValues = x;
      return axis;
    };
    axis.tickFormat = function(x) {
      if (!arguments.length) return tickFormat_;
      tickFormat_ = x;
      return axis;
    };
    axis.tickSize = function(x) {
      var n = arguments.length;
      if (!n) return innerTickSize;
      innerTickSize = +x;
      outerTickSize = +arguments[n - 1];
      return axis;
    };
    axis.innerTickSize = function(x) {
      if (!arguments.length) return innerTickSize;
      innerTickSize = +x;
      return axis;
    };
    axis.outerTickSize = function(x) {
      if (!arguments.length) return outerTickSize;
      outerTickSize = +x;
      return axis;
    };
    axis.tickPadding = function(x) {
      if (!arguments.length) return tickPadding;
      tickPadding = +x;
      return axis;
    };
    axis.tickSubdivide = function() {
      return arguments.length && axis;
    };
    return axis;
  };
  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };
  function d3_svg_axisX(selection, x) {
    selection.attr("transform", function(d) {
      return "translate(" + x(d) + ",0)";
    });
  }
  function d3_svg_axisY(selection, y) {
    selection.attr("transform", function(d) {
      return "translate(0," + y(d) + ")";
    });
  }
  d3.svg.brush = function() {
    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
    function brush(g) {
      g.each(function() {
        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
        var background = g.selectAll(".background").data([ 0 ]);
        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
        var resize = g.selectAll(".resize").data(resizes, d3_identity);
        resize.exit().remove();
        resize.enter().append("g").attr("class", function(d) {
          return "resize " + d;
        }).style("cursor", function(d) {
          return d3_svg_brushCursor[d];
        }).append("rect").attr("x", function(d) {
          return /[ew]$/.test(d) ? -3 : null;
        }).attr("y", function(d) {
          return /^[ns]/.test(d) ? -3 : null;
        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
        resize.style("display", brush.empty() ? "none" : null);
        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
        if (x) {
          range = d3_scaleRange(x);
          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
          redrawX(gUpdate);
        }
        if (y) {
          range = d3_scaleRange(y);
          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
          redrawY(gUpdate);
        }
        redraw(gUpdate);
      });
    }
    brush.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments), extent1 = {
          x: xExtent,
          y: yExtent,
          i: xExtentDomain,
          j: yExtentDomain
        }, extent0 = this.__chart__ || extent1;
        this.__chart__ = extent1;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.brush", function() {
            xExtentDomain = extent0.i;
            yExtentDomain = extent0.j;
            xExtent = extent0.x;
            yExtent = extent0.y;
            event_({
              type: "brushstart"
            });
          }).tween("brush:brush", function() {
            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
            xExtentDomain = yExtentDomain = null;
            return function(t) {
              xExtent = extent1.x = xi(t);
              yExtent = extent1.y = yi(t);
              event_({
                type: "brush",
                mode: "resize"
              });
            };
          }).each("end.brush", function() {
            xExtentDomain = extent1.i;
            yExtentDomain = extent1.j;
            event_({
              type: "brush",
              mode: "resize"
            });
            event_({
              type: "brushend"
            });
          });
        } else {
          event_({
            type: "brushstart"
          });
          event_({
            type: "brush",
            mode: "resize"
          });
          event_({
            type: "brushend"
          });
        }
      });
    };
    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
      });
    }
    function redrawX(g) {
      g.select(".extent").attr("x", xExtent[0]);
      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
    }
    function redrawY(g) {
      g.select(".extent").attr("y", yExtent[0]);
      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
    }
    function brushstart() {
      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(), center, origin = d3.mouse(target), offset;
      var w = d3.select(d3_window).on("keydown.brush", keydown).on("keyup.brush", keyup);
      if (d3.event.changedTouches) {
        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
      } else {
        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
      }
      g.interrupt().selectAll("*").interrupt();
      if (dragging) {
        origin[0] = xExtent[0] - origin[0];
        origin[1] = yExtent[0] - origin[1];
      } else if (resizing) {
        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
        origin[0] = xExtent[ex];
        origin[1] = yExtent[ey];
      } else if (d3.event.altKey) center = origin.slice();
      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
      d3.select("body").style("cursor", eventTarget.style("cursor"));
      event_({
        type: "brushstart"
      });
      brushmove();
      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= xExtent[1];
            origin[1] -= yExtent[1];
            dragging = 2;
          }
          d3_eventPreventDefault();
        }
      }
      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += xExtent[1];
          origin[1] += yExtent[1];
          dragging = 0;
          d3_eventPreventDefault();
        }
      }
      function brushmove() {
        var point = d3.mouse(target), moved = false;
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }
        if (!dragging) {
          if (d3.event.altKey) {
            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
            origin[0] = xExtent[+(point[0] < center[0])];
            origin[1] = yExtent[+(point[1] < center[1])];
          } else center = null;
        }
        if (resizingX && move1(point, x, 0)) {
          redrawX(g);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g);
          moved = true;
        }
        if (moved) {
          redraw(g);
          event_({
            type: "brush",
            mode: dragging ? "move" : "resize"
          });
        }
      }
      function move1(point, scale, i) {
        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }
        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
        if (dragging) {
          max = (min += position) + size;
        } else {
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }
        if (extent[0] != min || extent[1] != max) {
          if (i) yExtentDomain = null; else xExtentDomain = null;
          extent[0] = min;
          extent[1] = max;
          return true;
        }
      }
      function brushend() {
        brushmove();
        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
        d3.select("body").style("cursor", null);
        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
        dragRestore();
        event_({
          type: "brushend"
        });
      }
    }
    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.clamp = function(z) {
      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
      return brush;
    };
    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      if (!arguments.length) {
        if (x) {
          if (xExtentDomain) {
            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
          } else {
            x0 = xExtent[0], x1 = xExtent[1];
            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
            if (x1 < x0) t = x0, x0 = x1, x1 = t;
          }
        }
        if (y) {
          if (yExtentDomain) {
            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
          } else {
            y0 = yExtent[0], y1 = yExtent[1];
            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
            if (y1 < y0) t = y0, y0 = y1, y1 = t;
          }
        }
        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
      }
      if (x) {
        x0 = z[0], x1 = z[1];
        if (y) x0 = x0[0], x1 = x1[0];
        xExtentDomain = [ x0, x1 ];
        if (x.invert) x0 = x(x0), x1 = x(x1);
        if (x1 < x0) t = x0, x0 = x1, x1 = t;
        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
      }
      if (y) {
        y0 = z[0], y1 = z[1];
        if (x) y0 = y0[1], y1 = y1[1];
        yExtentDomain = [ y0, y1 ];
        if (y.invert) y0 = y(y0), y1 = y(y1);
        if (y1 < y0) t = y0, y0 = y1, y1 = t;
        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
      }
      return brush;
    };
    brush.clear = function() {
      if (!brush.empty()) {
        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
        xExtentDomain = yExtentDomain = null;
      }
      return brush;
    };
    brush.empty = function() {
      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
    };
    return d3.rebind(brush, event, "on");
  };
  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
  var d3_time_formatUtc = d3_time_format.utc;
  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
  function d3_time_formatIsoNative(date) {
    return date.toISOString();
  }
  d3_time_formatIsoNative.parse = function(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  };
  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
  d3_time.second = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 1e3) * 1e3);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
  }, function(date) {
    return date.getSeconds();
  });
  d3_time.seconds = d3_time.second.range;
  d3_time.seconds.utc = d3_time.second.utc.range;
  d3_time.minute = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 6e4) * 6e4);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
  }, function(date) {
    return date.getMinutes();
  });
  d3_time.minutes = d3_time.minute.range;
  d3_time.minutes.utc = d3_time.minute.utc.range;
  d3_time.hour = d3_time_interval(function(date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
  }, function(date) {
    return date.getHours();
  });
  d3_time.hours = d3_time.hour.range;
  d3_time.hours.utc = d3_time.hour.utc.range;
  d3_time.month = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setDate(1);
    return date;
  }, function(date, offset) {
    date.setMonth(date.getMonth() + offset);
  }, function(date) {
    return date.getMonth();
  });
  d3_time.months = d3_time.month.range;
  d3_time.months.utc = d3_time.month.utc.range;
  function d3_time_scale(linear, methods, format) {
    function scale(x) {
      return linear(x);
    }
    scale.invert = function(x) {
      return d3_time_scaleDate(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
      linear.domain(x);
      return scale;
    };
    function tickMethod(extent, count) {
      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
        return d / 31536e6;
      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
    }
    scale.nice = function(interval, skip) {
      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
      if (method) interval = method[0], skip = method[1];
      function skipped(date) {
        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
      }
      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
        floor: function(date) {
          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
          return date;
        },
        ceil: function(date) {
          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
          return date;
        }
      } : interval));
    };
    scale.ticks = function(interval, skip) {
      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
        range: interval
      }, skip ];
      if (method) interval = method[0], skip = method[1];
      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
    };
    scale.tickFormat = function() {
      return format;
    };
    scale.copy = function() {
      return d3_time_scale(linear.copy(), methods, format);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_time_scaleDate(t) {
    return new Date(t);
  }
  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
    return d.getMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getMinutes();
  } ], [ "%I %p", function(d) {
    return d.getHours();
  } ], [ "%a %d", function(d) {
    return d.getDay() && d.getDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getDate() != 1;
  } ], [ "%B", function(d) {
    return d.getMonth();
  } ], [ "%Y", d3_true ] ]);
  var d3_time_scaleMilliseconds = {
    range: function(start, stop, step) {
      return d3.range(+start, +stop, step).map(d3_time_scaleDate);
    },
    floor: d3_identity,
    ceil: d3_identity
  };
  d3_time_scaleLocalMethods.year = d3_time.year;
  d3_time.scale = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
  };
  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
    return [ m[0].utc, m[1] ];
  });
  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
    return d.getUTCMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getUTCSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getUTCMinutes();
  } ], [ "%I %p", function(d) {
    return d.getUTCHours();
  } ], [ "%a %d", function(d) {
    return d.getUTCDay() && d.getUTCDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getUTCDate() != 1;
  } ], [ "%B", function(d) {
    return d.getUTCMonth();
  } ], [ "%Y", d3_true ] ]);
  d3_time_scaleUtcMethods.year = d3_time.year.utc;
  d3_time.scale.utc = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
  };
  d3.text = d3_xhrType(function(request) {
    return request.responseText;
  });
  d3.json = function(url, callback) {
    return d3_xhr(url, "application/json", d3_json, callback);
  };
  function d3_json(request) {
    return JSON.parse(request.responseText);
  }
  d3.html = function(url, callback) {
    return d3_xhr(url, "text/html", d3_html, callback);
  };
  function d3_html(request) {
    var range = d3_document.createRange();
    range.selectNode(d3_document.body);
    return range.createContextualFragment(request.responseText);
  }
  d3.xml = d3_xhrType(function(request) {
    return request.responseXML;
  });
  if (typeof define === "function" && define.amd) {
    define(d3);
  } else if (typeof module === "object" && module.exports) {
    module.exports = d3;
  } else {
    this.d3 = d3;
  }
}();
});
require.register("filter-view/drag.js", function(exports, require, module){
/**
 * Dependencies
 */

var Emitter = require('emitter');
var evnt = require('event');

/**
 * Expose `draggable`
 */

module.exports = function(el) {
  var emitter = new Emitter();
  var origin = [0, 0];
  var start = [0, 0];

  var onMouseDown = function(e) {
    origin = [el.offsetLeft, el.offsetTop];
    start = [e.pageX, e.pageY];

    emitter.emit('dragstart', {
      el: el,
      origin: origin,
      start: start,
      current: start
    });

    var onMouseMove = function(e) {
      var left = origin[0] + (e.pageX - start[0]);
      if (left >= 0 && left <= el.parentNode.offsetWidth) el.style.left = left +
        'px';

      return emitter.emit('drag', {
        el: el,
        origin: origin,
        start: start,
        current: [e.pageX, e.pageY]
      });
    };

    var onMouseUp = function(e) {
      emitter.emit('dragstop', {
        el: el,
        origin: origin,
        start: start,
        current: [e.pageX, e.pageY]
      });

      evnt.unbind(document, 'mousemove', onMouseMove);
      evnt.unbind(document, 'mouseup', onMouseUp);
    };

    evnt.bind(document, 'mousemove', onMouseMove);
    evnt.bind(document, 'mouseup', onMouseUp);
  };

  evnt.bind(el, 'mousedown', onMouseDown);
  emitter.on('remove', function() {
    evnt.unbind(el, 'mousedown', onMouseDown);
  });

  return emitter;
};

});
require.register("filter-view/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var d3 = require('d3');
var draggable = require('./drag');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * On construct
 */

View.on('construct', function(view) {
  view.reactive.bind('on-drag', function(el, name) {
    var drag = draggable(el);

    drag.on('drag', function(opts) {
      view[name](opts.el);
      view.setRange();
    });

    drag.on('dragend', function() {
      view.saveTime();
      drag.emit('remove');
    });
  });

  view.reactive.bind('data-mode', function(el, name) {
    this.change(function() {
      var val = this.value(name);
      if (val) el.classList.add('active');
      else el.classList.remove('active');
    });
  });

  view.on('rendered', function() {
    view.reactive.bind('data-style-left', function(el, name) {
      this.change(function() {
        var val = this.value(name);
        el.style.left = toPixels(el.parentNode.offsetWidth, val) + 'px';
        el.innerText = val;
      });
    });

    view.setRange();
  });
});

/**
 * Set Active
 */

View.prototype.setMode = function(e) {
  var el = e.target;
  var mode = el.dataset.mode;

  if (!mode) {
    el = el.parentNode;
    mode = el.dataset.mode;
  }

  this.model[mode](!el.classList.contains('active'));
  document.activeElement.blur();
};

/**
 * Save
 */

View.prototype.saveTime = function() {
  this.model.set({
    start: elToTime(this.find('.handle.start')),
    end: elToTime(this.find('.handle.end'))
  });
};

/**
 * Set Left
 */

View.prototype.setTime = function(el, time) {
  el.style.left = toPixels(el.parentNode.offsetWidth, time) + 'px';
  el.innerText = time;
};

/**
 * Update Start
 */

View.prototype.setStartPosition = function(el) {
  var endEl = this.find('.handle.end');
  var time = elToTime(el);

  if (time >= elToTime(endEl)) {
    if (time === 12) return this.setTime(el, 11);
    this.setTime(endEl, time + 1);
  }

  el.innerText = time;
};

/**
 * Update End
 */

View.prototype.setEndPosition = function(el) {
  var startEl = this.find('.handle.start');
  var time = elToTime(el);

  if (time <= elToTime(startEl)) {
    if (time === 0) return this.setTime(el, 1);
    this.setTime(startEl, time - 1);
  }

  el.innerText = time;
};

/**
 * Width
 */

View.prototype.setRange = function() {
  var range = this.find('.progress-bar.range');
  var left = this.find('.handle.start').offsetLeft;
  var right = this.find('.handle.end').offsetLeft;

  range.style.left = left + 'px';
  range.style.width = (right - left) + 'px';
};

/**
 * Element to time scale
 */

function elToTime(el) {
  return toTime(el.parentNode.offsetWidth, el.offsetLeft);
}

function toTime(width, pixels) {
  return d3.scale.linear()
    .domain([0, width])
    .rangeRound([0, 12])(pixels);
}

function toPixels(width, time) {
  return d3.scale.linear()
    .domain([0, 12])
    .range([0, width])(time);
}

});
require.register("options-view/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

});
require.register("plan/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var defaults = require('model-defaults');
var model = require('model');

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    start: 7,
    end: 9,
    bike: true,
    bus: true,
    train: true,
    car: true,
    walk: true
  }))
  .attr('start')
  .attr('end')
  .attr('bike')
  .attr('bus')
  .attr('train')
  .attr('car')
  .attr('walk');

});
require.register("transitive-view/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var map = require('map');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * On construct
 */

View.on('construct', function(view) {
  view.on('rendered', function() {
    var m = map(view.find('.map'), {
      center: {
        lat: 38.865860,
        lng: -77.063988
      },
      zoom: 14
    });
  });
});

});
require.register("planner-page/index.js", function(exports, require, module){
/**
 * Dependencies
 */

var FilterView = require('filter-view');
var OptionsView = require('options-view');
var Plan = require('plan');
var TransitiveView = require('transitive-view');
var view = require('view');

/**
 * Create `View`
 */

var View = view(require('./template.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  var plan = new Plan();

  ctx.view = new View({
    filter: new FilterView(plan),
    'options-view': new OptionsView(plan),
    transitive: new TransitiveView(plan)
  });

  document.getElementById('main').appendChild(ctx.view.el);

  ctx.view.emit('rendered');
  ctx.view.model.filter.emit('rendered');
  ctx.view.model['options-view'].emit('rendered');
  ctx.view.model.transitive.emit('rendered');
};

});
require.register("planner-app/index.js", function(exports, require, module){
/**
 * Dependencies
 */

// var Commuter = require('commuter');
// var introduction = require('introduction-page');
var onLoad = require('on-load');
var page = require('page');

/**
 * Set up routes
 */

page('/', redirect('/planner'));
page('/planner', /* session.load, introduction */ require('planner-page'));
// page('/planner/profile', function() {});
page('/planner/:link', /*session.load, Commuter.loadLink,*/ redirect('/planner'));

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function() {
  // show nav ?

  // listen
  page();
});

/**
 * redirect
 */

function redirect(to) {
  return function(ctx, next) {
    page(to);
  };
}

});































































require.register("manager-nav/template.html", function(exports, require, module){
module.exports = '<nav class="navbar navbar-default" role="navigation">\n  <div class="container">\n    <!-- Brand and toggle get grouped for better mobile display -->\n    <div class="navbar-header">\n      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#collapsed-navbar" data-visible="isLoggedIn">\n        <span class="sr-only">Toggle navigation</span>\n        <span class="icon-bar"></span>\n        <span class="icon-bar"></span>\n        <span class="icon-bar"></span>\n      </button>\n      <a class="navbar-brand" href="/manager"><i class="fa fa-users"></i> {name}</a>\n    </div>\n\n    <div class="collapse navbar-collapse" id="collapsed-navbar">\n      <ul class="nav navbar-nav">\n        <li data-visible="isAdmin"><a href="/manager/managers"><i class="fa fa-cogs"></i> Managers</a></li>\n        <li data-visible="isLoggedIn"><a href="/manager/organizations"><i class="fa fa-building-o"></i> Organizations</a></li>\n      </ul>\n\n      <div class="nav navbar-nav navbar-right">\n        <a data-visible="isLoggedIn" href="/manager/logout" class="btn btn-default navbar-btn"><i class="fa fa-sign-out"></i> Logout</a>\n      </div>\n    </div>\n  </div>\n</nav>';
});
require.register("404-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3 class="text-danger well">{ message || \'Page Not Found\' }</h3>\n  </div>\n</div>';
});
require.register("alert/template.html", function(exports, require, module){
module.exports = '<div class="alert alert-{type} alert-dismissable">\n  <button type="button" class="close" on-click="dispose">&times;</button>\n  <span data-text="text"></span>\n</div>';
});
require.register("alerts/template.html", function(exports, require, module){
module.exports = '<div class="container"><div class="row"><div class="col-lg-12 col-md-12 col-sm-12" id="alerts"></div></div></div>';
});









require.register("spinner/template.html", function(exports, require, module){
module.exports = '<div id="spinner"></div>';
});
require.register("change-password-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <form class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Change Password <a href="/manager/login" class="btn btn-default pull-right"><i class="fa fa-arrow-left"></i> Back</a></h3>\n    <div class="form-group">\n      <label for="password">Password</label>\n      <input type="password" class="form-control" id="password" placeholder="Password">\n    </div>\n    <div class="form-group">\n      <label for="repeat-password">Repeat Password</label>\n      <input type="password" class="form-control" id="repeat-password" placeholder="Repeat Password">\n    </div>\n    <button type="submit" class="btn btn-default" on-click="changePassword">Change Password</button>\n  </form>\n</div>';
});










require.register("commuter-form/template.html", function(exports, require, module){
module.exports = '<form>\n  <h3>\n    {action} Commuter\n    <a class="btn btn-default pull-right" href="{back}"><i class="fa fa-arrow-left"></i> Back</a>\n  </h3>\n  <div class="form-group" data-visible="isNew">\n    <label for="name">Name</label>\n    <input type="text" class="form-control" name="name" placeholder="Name" data-value="name">\n  </div>\n  <div class="form-group">\n    <label for="email">Email</label>\n    <input type="text" class="form-control" name="email" placeholder="Email" data-value="email" data-disabled="isEditing">\n  </div>\n  <div class="form-group" data-visible="isNew">\n    <label for="address">Address</label>\n    <input type="text" class="form-control" name="address" placeholder="Address" data-value="address">\n  </div>\n  <div class="form-group">\n    <label for="city">City</label>\n    <input type="text" class="form-control" name="city" placeholder="City" data-value="city" data-disabled="isEditing">\n  </div>\n  <div class="form-group">\n    <label for="state">State</label>\n    <input type="text" class="form-control" name="state" placeholder="State" data-value="state" data-disabled="isEditing">\n  </div>\n  <div class="form-group">\n    <label for="zip">Zip</label>\n    <input type="text" class="form-control" name="zip" placeholder="Zip" data-value="zip" data-disabled="isEditing">\n  </div>\n  <div class="form-group">\n    <label for="labels">Labels (comma separated)</label>\n    <input type="text" class="form-control" name="labels" placeholder="Labels" data-value="labels">\n  </div>\n  <button type="button" class="btn btn-primary" on-click="save">{action}</button>\n</form>';
});
require.register("commuter-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3>\n      Commuter\n      <a class="btn btn-default pull-right" href="/manager/organizations/{_organization}/show"><i class="fa fa-arrow-left"></i> Back</a>\n      <a class="btn btn-warning pull-right" href="/manager/organizations/{_organization}/commuters/{_id}/edit"><i class="fa fa-pencil"></i> Edit</a>\n      <a class="btn btn-danger pull-right" on-click="destroy"><i class="fa fa-times"></i> Delete</a>\n    </h3>\n    <p>{email}</p>\n    <p><a href="/plan/{link}" target="_blank">From <i class="fa fa-home"></i> {location} to <i class="fa fa-building-o"></i> {toLocation}</a></p>\n  </div>\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <div class="map"></div>\n  </div>\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <button class="btn btn-block btn-primary" on-click="sendPlan"><i class="fa fa-envelope"></i> Send Personalized Plan</button>\n  </div>\n</div>';
});

require.register("forgot-password-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <form class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Forgot Password? <a href="/manager/login" class="btn btn-default pull-right"><i class="fa fa-arrow-left"></i> Back</a></h3>\n    <div class="form-group">\n      <label for="email">Email</label>\n      <input type="email" class="form-control" id="email" placeholder="Email">\n    </div>\n    <button type="button" class="btn btn-default" on-click="sendChangeRequest">Submit Change Password Request</button>\n  </form>\n</div>';
});
require.register("login-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <form class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Login <a href="/manager/forgot-password" class="btn btn-default pull-right">Forgot password?</a></h3>\n    <div class="form-group">\n      <label for="email">Email</label>\n      <input type="email" class="form-control" id="email" placeholder="Email">\n    </div>\n    <div class="form-group">\n      <label for="password">Password</label>\n      <input type="password" class="form-control" id="password" placeholder="Password">\n    </div>\n    <button type="button" class="btn btn-default" on-click="login">Login</button>\n  </form>\n</div>';
});

require.register("managers-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Managers\n    <form class="form-inline pull-right">\n      <input class="form-control" id="email" type="email" placeholder="Email" />\n      <button class="btn btn-success" on-click="create"><i class="fa fa-plus"></i> Invite Manager</button>\n    </form>\n    </h3>\n  </div>\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <table class="table table-striped">\n      <thead>\n        <tr>\n          <th>Email</th>\n          <th>Action</th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    </table>\n  </div>\n</div>';
});
require.register("managers-page/manager.html", function(exports, require, module){
module.exports = '<tr>\n  <td>{email} <span class="label label-warning">{type || \'\'}</span></td>\n  <td>\n    <button class="btn btn-warning" on-click="makeAdmin" data-visible="isNotAdmin"><i class="fa fa-caret-up"></i> Give Admin Access</button>\n    <button class="btn btn-warning" on-click="removeAdmin" data-visible="isAdmin"><i class="fa fa-caret-down"></i> Remove Admin Access</button>\n    <button class="btn btn-info" on-click="resetPassword"><i class="fa fa-lock"></i> Reset Password</button>\n    <button class="btn btn-danger" on-click="destroy"><i class="fa fa-times"></i> Delete</button>\n  </td>\n</tr>';
});

require.register("organization-form/template.html", function(exports, require, module){
module.exports = '<form>\n  <h3>{action} Organization <a class="btn btn-default pull-right" data-href="back"><i class="fa fa-arrow-left"></i> Back</a></h3>\n  <div class="form-group">\n    <label for="name">Name</label>\n    <input type="text" class="form-control" name="name" placeholder="Name" data-value="name">\n  </div>\n  <div class="form-group">\n    <label for="contact">Contact</label>\n    <input type="text" class="form-control" name="contact" placeholder="Contact" data-value="contact">\n  </div>\n  <div class="form-group">\n    <label for="email">Email</label>\n    <input type="text" class="form-control" name="email" placeholder="Email" data-value="email">\n  </div>\n  <div class="form-group">\n    <label for="address">Address</label>\n    <input type="text" class="form-control" name="address" placeholder="Address" data-value="address">\n  </div>\n  <div class="form-group">\n    <label for="city">City</label>\n    <input type="text" class="form-control" name="city" placeholder="City" data-value="city">\n  </div>\n  <div class="form-group">\n    <label for="state">State</label>\n    <input type="text" class="form-control" name="state" placeholder="State" data-value="state">\n  </div>\n  <div class="form-group">\n    <label for="zip">Zip</label>\n    <input type="text" class="form-control" name="zip" placeholder="Zip" data-value="zip">\n  </div>\n  <div class="form-group">\n    <label for="labels">Labels (comma separated)</label>\n    <input type="text" class="form-control" name="labels" placeholder="Labels" data-value="labels">\n  </div>\n  <button type="button" class="btn btn-primary" on-click="save">{action}</button>\n</form>';
});




require.register("organization-page/row.html", function(exports, require, module){
module.exports = '<tr>\n  <td><a href="/manager/organizations/{_organization}/commuters/{_id}/show">{_user().email}</a></td>\n  <td>{location}</td>\n  <td data-html="labels"></td>\n</tr>';
});
require.register("organization-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3>\n      {name}\n      <a class="btn btn-default pull-right" href="/manager/organizations"><i class="fa fa-arrow-left"></i> Back</a>\n      <a class="btn btn-warning pull-right" href="/manager/organizations/{_id}/edit"><i class="fa fa-pencil"></i> Edit</a>\n      <button class="btn btn-danger pull-right" on-click="destroy"><i class="fa fa-times"></i> Delete</button>\n    </h3>\n    <p>{contact} — <a href="mailto:{email}">{email}</a></p>\n    <p>{address}, {city}, {state} {zip}</p>\n  </div>\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <div class="map"></div>\n  </div>\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Commuters <span class="label label-primary">{commuterCount}</span> <button class="btn btn-info pull-right" on-click="uploadCSV"><i class="fa fa-upload"></i> CSV</button> <a class="btn btn-success pull-right" href="/manager/organizations/{_id}/commuters/new"><i class="fa fa-plus"></i> Add</a></h3>\n    <table class="table table-striped">\n      <thead>\n        <tr>\n          <th>Email</th>\n          <th>Address</th>\n          <th>Labels</th>\n        </tr>\n      </thead>\n      <tbody data-each="commuters"></tbody>\n    </table>\n  </div>\n</div>';
});
require.register("organizations-page/row.html", function(exports, require, module){
module.exports = '<tr>\n  <td>\n    <a href="/manager/organizations/{_id}/show" data-text="name"></a>\n  </td>\n  <td data-text="address"></td>\n</tr>';
});
require.register("organizations-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Organizations <a class="btn btn-success pull-right" href="/manager/organizations/new"><i class="fa fa-plus"></i> Create</a></h3>\n  </div>\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <table class="table table-striped">\n      <thead>\n        <tr>\n          <th>Name</th>\n          <th>Address</th>\n        </tr>\n      </thead>\n      <tbody data-each="organizations"></tbody>\n    </table>\n  </div>\n</div>';
});


require.register("filter-view/template.html", function(exports, require, module){
module.exports = '<div class="filter-view row">\n  <div class="col-lg-1 col-md-1 col-sm-1">\n    <div class="btn-group">\n      <button type="button" class="btn btn-default dropdown-toggle" dropdown>M—F <span class="caret"></span></button>\n      <ul class="dropdown-menu" role="menu">\n        <li><a href="#">Monday to Friday</a></li>\n        <li><a href="#">Saturday</a></li>\n        <li><a href="#">Sunday</a></li>\n      </ul>\n    </div>\n  </div>\n  <div class="col-lg-3 col-md-3 col-sm-3 progress-container">\n    <div class="progress">\n      <div class="progress-bar handle start" on-drag="setStartPosition" data-style-left="start"></div>\n      <div class="progress-bar range"></div>\n      <div class="progress-bar handle end" on-drag="setEndPosition" data-style-left="end"></div>\n    </div>\n  </div>\n  <div class="col-lg-2 col-md-2 col-sm-2">\n    <div class="btn-group">\n      <button type="button" class="btn btn-default active">AM</button>\n      <button type="button" class="btn btn-default">PM</button>\n    </div>\n  </div>\n  <div class="col-lg-6 col-md-6 col-sm-6">\n    <div class="btn-group">\n      <button type="button" class="btn btn-default" data-mode="bike" on-click="setMode"><span class="svg-icon svg-icon-bike"></span></button>\n      <button type="button" class="btn btn-default" data-mode="bus" on-click="setMode"><span class="svg-icon svg-icon-bus"></span></button>\n      <button type="button" class="btn btn-default" data-mode="train" on-click="setMode"><span class="svg-icon svg-icon-train"></span></button>\n      <button type="button" class="btn btn-default" data-mode="car" on-click="setMode"><span class="svg-icon svg-icon-car"></span></button>\n      <button type="button" class="btn btn-default" data-mode="walk" on-click="setMode"><span class="svg-icon svg-icon-walk"></span></button>\n    </div>\n  </div>\n</div>\n';
});
require.register("options-view/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <h3>Your options</h3>\n    <hr>\n  </div>\n</div>';
});

require.register("transitive-view/template.html", function(exports, require, module){
module.exports = '<div class="transitive-view">\n  <div class="map"></div>\n</div>';
});
require.register("planner-page/template.html", function(exports, require, module){
module.exports = '<div class="row">\n  <div class="col-lg-12 col-md-12 col-sm-12">\n    <div reactive="filter"></div>\n  </div>\n</div>\n<div class="row">\n  <div class="col-lg-6 col-md-6 col-sm-6">\n    <div reactive="transitive"></div>\n  </div>\n  <div class="col-lg-6 col-md-6 col-sm-6">\n    <div reactive="options-view"></div>\n  </div>\n</div>\n';
});
require.alias("manager-app/index.js", "commute-planner/deps/manager-app/index.js");
require.alias("manager-app/index.js", "manager-app/index.js");
require.alias("ianstormtaylor-on-load/index.js", "manager-app/deps/on-load/index.js");
require.alias("ianstormtaylor-callback/index.js", "ianstormtaylor-on-load/deps/callback/index.js");
require.alias("timoxley-next-tick/index.js", "ianstormtaylor-callback/deps/next-tick/index.js");

require.alias("visionmedia-page.js/index.js", "manager-app/deps/page/index.js");

require.alias("manager-nav/index.js", "manager-app/deps/manager-nav/index.js");
require.alias("segmentio-view/lib/index.js", "manager-nav/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "manager-nav/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "manager-nav/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "manager-nav/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "manager-nav/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("manager-router/index.js", "manager-app/deps/manager-router/index.js");
require.alias("visionmedia-debug/debug.js", "manager-router/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "manager-router/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "manager-router/deps/page/index.js");

require.alias("404-page/index.js", "manager-router/deps/404-page/index.js");
require.alias("segmentio-view/lib/index.js", "404-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "404-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "404-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "404-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "404-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "404-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "404-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("alerts/index.js", "manager-router/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("analytics/index.js", "manager-router/deps/analytics/index.js");

require.alias("change-password-page/index.js", "manager-router/deps/change-password-page/index.js");
require.alias("segmentio-view/lib/index.js", "change-password-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "change-password-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "change-password-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "change-password-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "change-password-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "change-password-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "change-password-page/deps/page/index.js");

require.alias("alerts/index.js", "change-password-page/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("config/index.js", "change-password-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "change-password-page/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("commuter/index.js", "manager-router/deps/commuter/index.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "commuter/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "commuter/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "commuter/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "commuter/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "commuter/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "commuter/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "commuter/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("commuter-form/index.js", "manager-router/deps/commuter-form/index.js");
require.alias("trevorgerhardt-serialize/index.js", "commuter-form/deps/serialize/index.js");
require.alias("trevorgerhardt-serialize/index.js", "commuter-form/deps/serialize/index.js");
require.alias("component-query/index.js", "trevorgerhardt-serialize/deps/query/index.js");

require.alias("component-value/index.js", "trevorgerhardt-serialize/deps/value/index.js");
require.alias("component-value/index.js", "trevorgerhardt-serialize/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("trevorgerhardt-serialize/index.js", "trevorgerhardt-serialize/index.js");
require.alias("visionmedia-debug/debug.js", "commuter-form/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "commuter-form/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "commuter-form/deps/page/index.js");

require.alias("alert/index.js", "commuter-form/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("alerts/index.js", "commuter-form/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("commuter/index.js", "commuter-form/deps/commuter/index.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "commuter/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "commuter/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "commuter/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "commuter/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "commuter/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "commuter/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "commuter/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("config/index.js", "commuter-form/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("view/dropdown.js", "commuter-form/deps/view/dropdown.js");
require.alias("view/each.js", "commuter-form/deps/view/each.js");
require.alias("view/index.js", "commuter-form/deps/view/index.js");
require.alias("component-classes/index.js", "view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "view/deps/event/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "segmentio-reactive-child/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "segmentio-reactive-disabled/index.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "view/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "view/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("commuter-page/index.js", "manager-router/deps/commuter-page/index.js");
require.alias("segmentio-view/lib/index.js", "commuter-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "commuter-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "commuter-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "commuter-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "commuter-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "commuter-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "commuter-page/deps/page/index.js");

require.alias("alerts/index.js", "commuter-page/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("commuter/index.js", "commuter-page/deps/commuter/index.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "commuter/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "commuter/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "commuter/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "commuter/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "commuter/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "commuter/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "commuter/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("config/index.js", "commuter-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "commuter-page/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "commuter-page/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("config/index.js", "manager-router/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("forgot-password-page/index.js", "manager-router/deps/forgot-password-page/index.js");
require.alias("segmentio-value/index.js", "forgot-password-page/deps/value/index.js");
require.alias("segmentio-value/index.js", "forgot-password-page/deps/value/index.js");
require.alias("component-type/index.js", "segmentio-value/deps/type/index.js");

require.alias("segmentio-value/index.js", "segmentio-value/index.js");
require.alias("segmentio-view/lib/index.js", "forgot-password-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "forgot-password-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "forgot-password-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "forgot-password-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "forgot-password-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "forgot-password-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("request/index.js", "forgot-password-page/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("login-page/index.js", "manager-router/deps/login-page/index.js");
require.alias("segmentio-view/lib/index.js", "login-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "login-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "login-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "login-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "login-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "login-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "login-page/deps/page/index.js");

require.alias("alerts/index.js", "login-page/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("config/index.js", "login-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "login-page/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("managers-page/index.js", "manager-router/deps/managers-page/index.js");
require.alias("segmentio-view/lib/index.js", "managers-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "managers-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "managers-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "managers-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "managers-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "managers-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "managers-page/deps/page/index.js");

require.alias("alerts/index.js", "managers-page/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("config/index.js", "managers-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "managers-page/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("session/index.js", "managers-page/deps/session/index.js");
require.alias("component-model/lib/index.js", "session/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "session/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "session/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "session/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "session/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("visionmedia-debug/debug.js", "session/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "session/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "session/deps/page/index.js");

require.alias("analytics/index.js", "session/deps/analytics/index.js");

require.alias("config/index.js", "session/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "session/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("user/index.js", "session/deps/user/index.js");
require.alias("component-model/lib/index.js", "user/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "user/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "user/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "user/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "user/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("user/index.js", "managers-page/deps/user/index.js");
require.alias("component-model/lib/index.js", "user/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "user/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "user/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "user/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "user/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("organization/index.js", "manager-router/deps/organization/index.js");
require.alias("component-model/lib/index.js", "organization/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "organization/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "organization/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "organization/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "organization/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "organization/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "organization/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "organization/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("organization-form/index.js", "manager-router/deps/organization-form/index.js");
require.alias("segmentio-view/lib/index.js", "organization-form/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "organization-form/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "organization-form/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "organization-form/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("trevorgerhardt-serialize/index.js", "organization-form/deps/serialize/index.js");
require.alias("trevorgerhardt-serialize/index.js", "organization-form/deps/serialize/index.js");
require.alias("component-query/index.js", "trevorgerhardt-serialize/deps/query/index.js");

require.alias("component-value/index.js", "trevorgerhardt-serialize/deps/value/index.js");
require.alias("component-value/index.js", "trevorgerhardt-serialize/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("trevorgerhardt-serialize/index.js", "trevorgerhardt-serialize/index.js");
require.alias("visionmedia-debug/debug.js", "organization-form/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organization-form/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "organization-form/deps/page/index.js");

require.alias("alerts/index.js", "organization-form/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("config/index.js", "organization-form/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("organization/index.js", "organization-form/deps/organization/index.js");
require.alias("component-model/lib/index.js", "organization/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "organization/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "organization/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "organization/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "organization/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "organization/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "organization/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "organization/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("organization-page/index.js", "manager-router/deps/organization-page/index.js");
require.alias("component-each/index.js", "organization-page/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-file/index.js", "organization-page/deps/file/index.js");
require.alias("component-file/file.js", "organization-page/deps/file/file.js");
require.alias("component-file/reader.js", "organization-page/deps/file/reader.js");
require.alias("component-emitter/index.js", "component-file/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-file-picker/index.js", "organization-page/deps/file-picker/index.js");
require.alias("component-event/index.js", "component-file-picker/deps/event/index.js");

require.alias("trevorgerhardt-csv-to-array/index.js", "organization-page/deps/csv-to-array/index.js");

require.alias("visionmedia-batch/index.js", "organization-page/deps/batch/index.js");
require.alias("component-emitter/index.js", "visionmedia-batch/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("visionmedia-debug/debug.js", "organization-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organization-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "organization-page/deps/page/index.js");

require.alias("alerts/index.js", "organization-page/deps/alerts/index.js");
require.alias("component-domify/index.js", "alerts/deps/domify/index.js");

require.alias("component-each/index.js", "alerts/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "alerts/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("alert/index.js", "alerts/deps/alert/index.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "alert/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "alert/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "alert/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("config/index.js", "alerts/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("commuter/index.js", "organization-page/deps/commuter/index.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "commuter/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "commuter/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "commuter/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "commuter/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "commuter/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "commuter/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "commuter/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "commuter/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "commuter/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "commuter/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("config/index.js", "organization-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "organization-page/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("organization/index.js", "organization-page/deps/organization/index.js");
require.alias("component-model/lib/index.js", "organization/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "organization/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "organization/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "organization/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "organization/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "organization/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "organization/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "organization/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "organization-page/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("spinner/index.js", "organization-page/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("view/dropdown.js", "organization-page/deps/view/dropdown.js");
require.alias("view/each.js", "organization-page/deps/view/each.js");
require.alias("view/index.js", "organization-page/deps/view/index.js");
require.alias("component-classes/index.js", "view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "view/deps/event/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "segmentio-reactive-child/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "segmentio-reactive-disabled/index.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "view/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "view/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("organizations-page/index.js", "manager-router/deps/organizations-page/index.js");
require.alias("organizations-page/row.js", "manager-router/deps/organizations-page/row.js");
require.alias("segmentio-view/lib/index.js", "organizations-page/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "organizations-page/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "organizations-page/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "organizations-page/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("visionmedia-debug/debug.js", "organizations-page/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organizations-page/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "organizations-page/deps/page/index.js");

require.alias("config/index.js", "organizations-page/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "organizations-page/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("organization/index.js", "organizations-page/deps/organization/index.js");
require.alias("component-model/lib/index.js", "organization/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "organization/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "organization/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "organization/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "organization/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("segmentio-model-memoize/index.js", "organization/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "organization/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "organization/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "organization/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("map/index.js", "organization/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("session/index.js", "manager-router/deps/session/index.js");
require.alias("component-model/lib/index.js", "session/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "session/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "session/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "session/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "session/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("visionmedia-debug/debug.js", "session/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "session/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "session/deps/page/index.js");

require.alias("analytics/index.js", "session/deps/analytics/index.js");

require.alias("config/index.js", "session/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "session/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("user/index.js", "session/deps/user/index.js");
require.alias("component-model/lib/index.js", "user/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "user/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "user/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "user/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "user/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("session/index.js", "manager-app/deps/session/index.js");
require.alias("component-model/lib/index.js", "session/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "session/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "session/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "session/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "session/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("visionmedia-debug/debug.js", "session/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "session/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "session/deps/page/index.js");

require.alias("analytics/index.js", "session/deps/analytics/index.js");

require.alias("config/index.js", "session/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("request/index.js", "session/deps/request/index.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "request/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "request/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("config/index.js", "request/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("spinner/index.js", "request/deps/spinner/index.js");
require.alias("component-domify/index.js", "spinner/deps/domify/index.js");

require.alias("component-spin/index.js", "spinner/deps/spin/index.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-spin/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-css/lib/css.js", "component-spin/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "component-spin/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "component-spin/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "component-spin/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "component-spin/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "component-spin/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "component-spin/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "component-spin/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "component-spin/deps/css/lib/computed.js");
require.alias("component-css/index.js", "component-spin/deps/css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("component-spinner/index.js", "component-spin/deps/spinner/index.js");
require.alias("component-autoscale-canvas/index.js", "component-spinner/deps/autoscale-canvas/index.js");

require.alias("component-raf/index.js", "component-spinner/deps/raf/index.js");

require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-spinner/deps/canvas/index.js");
require.alias("component-has-canvas/index.js", "component-has-canvas/index.js");
require.alias("matthewp-text/index.js", "component-spinner/deps/text/index.js");

require.alias("component-removed/index.js", "component-spin/deps/removed/index.js");
require.alias("component-removed/fallback.js", "component-spin/deps/removed/fallback.js");
require.alias("component-removed/dom3.js", "component-spin/deps/removed/dom3.js");
require.alias("component-removed/dom4.js", "component-spin/deps/removed/dom4.js");
require.alias("component-within-document/index.js", "component-removed/deps/within-document/index.js");

require.alias("component-mutation-observer/index.js", "component-removed/deps/mutation-observer/index.js");

require.alias("user/index.js", "session/deps/user/index.js");
require.alias("component-model/lib/index.js", "user/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "user/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "user/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "user/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("trevorgerhardt-model-query/index.js", "user/deps/model-query/index.js");
require.alias("component-collection/index.js", "trevorgerhardt-model-query/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("trevorgerhardt-model-query/index.js", "trevorgerhardt-model-query/index.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "user/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("config/index.js", "user/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("planner-app/index.js", "commute-planner/deps/planner-app/index.js");
require.alias("planner-app/index.js", "planner-app/index.js");
require.alias("ianstormtaylor-on-load/index.js", "planner-app/deps/on-load/index.js");
require.alias("ianstormtaylor-callback/index.js", "ianstormtaylor-on-load/deps/callback/index.js");
require.alias("timoxley-next-tick/index.js", "ianstormtaylor-callback/deps/next-tick/index.js");

require.alias("visionmedia-page.js/index.js", "planner-app/deps/page/index.js");

require.alias("planner-page/index.js", "planner-app/deps/planner-page/index.js");
require.alias("filter-view/drag.js", "planner-page/deps/filter-view/drag.js");
require.alias("filter-view/index.js", "planner-page/deps/filter-view/index.js");
require.alias("component-emitter/index.js", "filter-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-event/index.js", "filter-view/deps/event/index.js");

require.alias("mbostock-d3/d3.js", "filter-view/deps/d3/d3.js");
require.alias("mbostock-d3/d3.js", "filter-view/deps/d3/index.js");
require.alias("mbostock-d3/d3.js", "mbostock-d3/index.js");
require.alias("view/dropdown.js", "filter-view/deps/view/dropdown.js");
require.alias("view/each.js", "filter-view/deps/view/each.js");
require.alias("view/index.js", "filter-view/deps/view/index.js");
require.alias("component-classes/index.js", "view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "view/deps/event/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "segmentio-reactive-child/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "segmentio-reactive-disabled/index.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "view/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "view/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("options-view/index.js", "planner-page/deps/options-view/index.js");
require.alias("view/dropdown.js", "options-view/deps/view/dropdown.js");
require.alias("view/each.js", "options-view/deps/view/each.js");
require.alias("view/index.js", "options-view/deps/view/index.js");
require.alias("component-classes/index.js", "view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "view/deps/event/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "segmentio-reactive-child/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "segmentio-reactive-disabled/index.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "view/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "view/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("plan/index.js", "planner-page/deps/plan/index.js");
require.alias("component-model/lib/index.js", "plan/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "plan/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "plan/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "plan/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "component-enumerable/deps/isarray/index.js");
require.alias("juliangruber-isarray/index.js", "juliangruber-isarray/index.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("segmentio-model-defaults/index.js", "plan/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("manuelstofer-is/index.js", "segmentio-model-defaults/deps/is/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-is/deps/each/index.js");

require.alias("transitive-view/index.js", "planner-page/deps/transitive-view/index.js");
require.alias("map/index.js", "transitive-view/deps/map/index.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "map/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("visionmedia-page.js/index.js", "map/deps/page/index.js");

require.alias("config/index.js", "map/deps/config/index.js");
require.alias("component-each/index.js", "config/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("view/dropdown.js", "transitive-view/deps/view/dropdown.js");
require.alias("view/each.js", "transitive-view/deps/view/each.js");
require.alias("view/index.js", "transitive-view/deps/view/index.js");
require.alias("component-classes/index.js", "view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "view/deps/event/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "segmentio-reactive-child/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "segmentio-reactive-disabled/index.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "view/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "view/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("view/dropdown.js", "planner-page/deps/view/dropdown.js");
require.alias("view/each.js", "planner-page/deps/view/each.js");
require.alias("view/index.js", "planner-page/deps/view/index.js");
require.alias("component-classes/index.js", "view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "view/deps/event/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "view/deps/reactive-child/index.js");
require.alias("segmentio-reactive-child/index.js", "segmentio-reactive-child/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "view/deps/reactive-disabled/index.js");
require.alias("segmentio-reactive-disabled/index.js", "segmentio-reactive-disabled/index.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "view/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/statics.js", "view/deps/view/lib/statics.js");
require.alias("segmentio-view/lib/index.js", "view/deps/view/index.js");
require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "visionmedia-debug/index.js");
require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("ianstormtaylor-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("jkroso-classes/index.js", "ianstormtaylor-classes/deps/classes/index.js");
require.alias("jkroso-classes/fallback.js", "ianstormtaylor-classes/deps/classes/fallback.js");
require.alias("jkroso-classes/modern.js", "ianstormtaylor-classes/deps/classes/modern.js");
require.alias("component-indexof/index.js", "jkroso-classes/deps/indexof/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");;require("planner-app");

(function(
  // Reliable reference to the global object (i.e. window in browsers).
  global,

  // Dummy constructor that we use as the .constructor property for
  // functions that return Generator objects.
  GeneratorFunction,

  // Undefined value, more compressible than void 0.
  undefined
) {
  var hasOwn = Object.prototype.hasOwnProperty;

  if (global.wrapGenerator) {
    return;
  }

  function wrapGenerator(innerFn, self, tryList) {
    return new Generator(innerFn, self || null, tryList || []);
  }

  global.wrapGenerator = wrapGenerator;
  if (typeof exports !== "undefined") {
    exports.wrapGenerator = wrapGenerator;
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  wrapGenerator.mark = function(genFun) {
    genFun.constructor = GeneratorFunction;
    return genFun;
  };

  // Ensure isGeneratorFunction works when Function#name not supported.
  if (GeneratorFunction.name !== "GeneratorFunction") {
    GeneratorFunction.name = "GeneratorFunction";
  }

  wrapGenerator.isGeneratorFunction = function(genFun) {
    var ctor = genFun && genFun.constructor;
    return ctor ? GeneratorFunction.name === ctor.name : false;
  };

  function Generator(innerFn, self, tryList) {
    var generator = this;
    var context = new Context(tryList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        throw new Error("Generator has already finished");
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          try {
            var info = delegate.generator[method](arg);

            // Delegate generator ran and handled its own exceptions so
            // regardless of what the method was, we continue as if it is
            // "next" with an undefined arg.
            method = "next";
            arg = undefined;

          } catch (uncaught) {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = uncaught;

            continue;
          }

          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        }

        state = GenStateExecuting;

        try {
          var value = innerFn.call(self, context);

          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: value,
            done: context.done
          };

          if (value === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } catch (thrown) {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(thrown);
          } else {
            arg = thrown;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator.throw = invoke.bind(generator, "throw");
  }

  Generator.prototype.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(triple) {
    var entry = { tryLoc: triple[0] };

    if (1 in triple) {
      entry.catchLoc = triple[1];
    }

    if (2 in triple) {
      entry.finallyLoc = triple[2];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry, i) {
    var record = entry.completion || {};
    record.type = i === 0 ? "normal" : "return";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryList.forEach(pushTryEntry, this);
    this.reset();
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    keys: function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    _findFinallyEntry: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") && (
              entry.finallyLoc === finallyLoc ||
              this.prev < entry.finallyLoc)) {
          return entry;
        }
      }
    },

    abrupt: function(type, arg) {
      var entry = this._findFinallyEntry();
      var record = entry ? entry.completion : {};

      record.type = type;
      record.arg = arg;

      if (entry) {
        this.next = entry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      var entry = this._findFinallyEntry(finallyLoc);
      return this.complete(entry.completion);
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry, i);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(generator, resultName, nextLoc) {
      this.delegate = {
        generator: generator,
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
}).apply(this, Function("return [this, function GeneratorFunction(){}]")());

module.exports = Lookup;
var url = require('url');
var path = require('path');
var debug = require('debug')('component-builder:scripts:lookup');
var createManifest = require('component-manifest');

var EXTENSIONS = [ // default extensions to look up
  '',
  '.js',
  '.json',
  '/index.js',
];

var RELATIVE_PATH = /^\.{1,2}\/.*/;

/**
 * From a file, lookup another file within that dep.
 * For use within `require()`s.
 * 
 * @param {Object} file
 * @param {Object} opts for manifest generator
 */
function Lookup (file, opts) {
  if (!(this instanceof Lookup)) return new Lookup(file, opts);
  this.file = file;
  this.opts = opts;
  this.manifestGenerator = createManifest(opts);
}

/**
 * Executes a lookup.
 * 
 * @type {String} target
 */
Lookup.prototype.exec = wrapGenerator.mark(function(target) {
  var ret;

  return wrapGenerator(function($ctx0) {
    while (1) switch ($ctx0.prev = $ctx0.next) {
    case 0:
      if (!RELATIVE_PATH.exec(target)) {
        $ctx0.next = 7;
        break;
      }

      ret = this.relatives(target);

      if (!(ret != null)) {
        $ctx0.next = 4;
        break;
      }

      return $ctx0.abrupt("return", ret);
    case 4:
      return $ctx0.abrupt("return", target);
    case 7:
      return $ctx0.delegateYield(this.nonrelatives(target), "t0", 8);
    case 8:
      ret = $ctx0.t0;
      return $ctx0.abrupt("return", ret);
    case 10:
    case "end":
      return $ctx0.stop();
    }
  }, this);
});

/**
 * Lookup a relative file.
 * 
 * @param  {String} target
 * @param  {Object} file
 * @return {String}
 */
Lookup.prototype.relatives = function (target, file) {
  file || (file = this.file);

  var path_ = url.resolve(file.path, target);
  var files = file.manifest.files;

  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    // we need this fallback to check relatives from a foreign local
    var name = f.name || path.join(f.manifest.name, path.relative(f.manifest.path, f.filename));

    for (var j = 0; j < EXTENSIONS.length; j++) {
      // check by adding extensions
      if (f.path === path_ + EXTENSIONS[j]) return name;
    }
    // check by removing extensions
    if (f.path.replace(/\.\w+$/, '') === path_) return name;
  };

  var message = 'ignore "' + target + '" , could not resolve from "' + file.branch.name + '"\'s file "' + file.path + '"';
  debug(message);

  return null;
};

/**
 * Lookup a nonrelative file.
 * 
 * @param  {String} target
 * @return {String}
 */
Lookup.prototype.nonrelatives = wrapGenerator.mark(function(target) {
  var frags, head, tail, ret, deps, names, name, dep, i;

  return wrapGenerator(function($ctx1) {
    while (1) switch ($ctx1.prev = $ctx1.next) {
    case 0:
      frags = tofrags(target);
      head = frags[0], tail = frags[1];

      // aliases
      ret = this.aliases.apply(this, frags);

      if (!(ret != null)) {
        $ctx1.next = 5;
        break;
      }

      return $ctx1.abrupt("return", ret);
    case 5:
      return $ctx1.delegateYield(this.locals(target), "t1", 6);
    case 6:
      ret = $ctx1.t1;

      if (!(ret != null)) {
        $ctx1.next = 9;
        break;
      }

      return $ctx1.abrupt("return", ret);
    case 9:
      return $ctx1.delegateYield(this.dependencies(target), "t2", 10);
    case 10:
      ret = $ctx1.t2;

      if (!(ret != null)) {
        $ctx1.next = 13;
        break;
      }

      return $ctx1.abrupt("return", ret);
    case 13:
      deps = this.file.branch.dependencies;
      names = Object.keys(deps);
      i = 0;
    case 16:
      if (!(i < names.length)) {
        $ctx1.next = 24;
        break;
      }

      name = names[i];
      dep = deps[name];

      if (!(dep.node.name.toLowerCase() === head)) {
        $ctx1.next = 21;
        break;
      }

      return $ctx1.abrupt("return", dep.canonical + tail);
    case 21:
      i++;
      $ctx1.next = 16;
      break;
    case 24:
      // to do: look up stuff outside the dependencies
      debug('could not resolve "%s" from "%s"', target, this.file.name);

      return $ctx1.abrupt("return", target);
    case 26:
    case "end":
      return $ctx1.stop();
    }
  }, this);
});

/**
 * Lookup an alias.
 *
 * <user>-<repo>
 * <user>~<repo>
 * 
 * @param  {String} head
 * @param  {String} tail
 * @return {String}
 */
Lookup.prototype.aliases = function (head, tail) {
  var deps = this.file.branch.dependencies;
  var name;

  function fn (canonical) {
    if (tail)
      return [canonical, tail].join('/');
    else
      return canonical;
  }

  if (~head.indexOf('~')) { // <user>~<repo>
    name = head.replace('~', '/');
    if (deps[name])
      return fn(deps[name].canonical);
  } else if (~head.indexOf('-')) { // <user>-<repo>
    var names = Object.keys(deps);
    for (var i = 0; i < names.length; i++) {
      name = names[i];
      if (head === name.replace('/', '-'))
        return fn(deps[name].canonical);
    }
  }

  return null;
};

Lookup.prototype.foreignRelative = wrapGenerator.mark(function(branch, relativeFile) {
  var manifest, dummy, resolved, relative;

  return wrapGenerator(function($ctx2) {
    while (1) switch ($ctx2.prev = $ctx2.next) {
    case 0:
      if (!(typeof branch !== 'object')) {
        $ctx2.next = 2;
        break;
      }

      throw new Error('branch must be supplied');
    case 2:
      return $ctx2.delegateYield(this.manifestGenerator(branch), "t3", 3);
    case 3:
      manifest = $ctx2.t3;

      dummy = {
        path: '', // it should simulate a url-relative path
        manifest: manifest,
        branch: branch
      };

      resolved = this.relatives(relativeFile, dummy);

      if (!(resolved == null)) {
        $ctx2.next = 8;
        break;
      }

      return $ctx2.abrupt("return", null);
    case 8:
      relative = path.relative(manifest.name, resolved);
      return $ctx2.abrupt("return", relative);
    case 10:
    case "end":
      return $ctx2.stop();
    }
  }, this);
});

/**
 * Lookup a local dependency.
 *
 * <local-name>
 * <local-name>/<filename>
 * 
 * @param  {String} target
 * @return {String}
 */
Lookup.prototype.locals = wrapGenerator.mark(function(target) {
  var deps, keys, match, re, i, head, tail, canonical, relativeFile, resolvedTail;

  return wrapGenerator(function($ctx3) {
    while (1) switch ($ctx3.prev = $ctx3.next) {
    case 0:
      deps = this.file.branch.locals;
      keys = Object.keys(deps);
      i = 0;
    case 3:
      if (!(i < keys.length)) {
        $ctx3.next = 20;
        break;
      }

      re = new RegExp("^(" + keys[i] + ")(/.*)?$");

      if (!(match = re.exec(target))) {
        $ctx3.next = 17;
        break;
      }

      head = match[1];
      tail = match[2] || '';
      canonical = deps[head].canonical;

      if (!(tail !== '')) {
        $ctx3.next = 16;
        break;
      }

      relativeFile = '.' + tail;
      return $ctx3.delegateYield(this.foreignRelative(deps[head], relativeFile), "t4", 12);
    case 12:
      resolvedTail = $ctx3.t4;

      if (!(resolvedTail != null)) {
        $ctx3.next = 16;
        break;
      }

      debug('resolved relative file for local "' + head + '/' + resolvedTail + '"');
      return $ctx3.abrupt("return", canonical + '/' + resolvedTail);
    case 16:
      return $ctx3.abrupt("return", canonical + tail);
    case 17:
      i++;
      $ctx3.next = 3;
      break;
    case 20:
    case "end":
      return $ctx3.stop();
    }
  }, this);
});

/**
 * Lookup a remote dependency.
 *
 * <repo>
 * <reference>/<filename>
 * 
 * @param  {String} target
 * @return {String}
 */
Lookup.prototype.dependencies = wrapGenerator.mark(function(target) {
  var deps, keys, match, re, i, head, tail, canonical, relativeFile, resolvedTail;

  return wrapGenerator(function($ctx4) {
    while (1) switch ($ctx4.prev = $ctx4.next) {
    case 0:
      deps = this.file.branch.dependencies;
      keys = Object.keys(deps);
      i = 0;
    case 3:
      if (!(i < keys.length)) {
        $ctx4.next = 20;
        break;
      }

      head = keys[i];
      re = new RegExp("^(" + head.split('/')[1] + ")(/.*)?$");

      if (!(match = re.exec(target))) {
        $ctx4.next = 17;
        break;
      }

      tail = match[2] || '';
      canonical = deps[head].canonical;

      if (!(tail !== '')) {
        $ctx4.next = 16;
        break;
      }

      relativeFile = tail.slice(1);
      return $ctx4.delegateYield(this.foreignRelative(deps[head], relativeFile), "t5", 12);
    case 12:
      resolvedTail = $ctx4.t5;

      if (!(resolvedTail != null)) {
        $ctx4.next = 16;
        break;
      }

      debug('resolved relative file for dependency "' + head + '/' + resolvedTail + '"');
      return $ctx4.abrupt("return", canonical + '/' + resolvedTail);
    case 16:
      return $ctx4.abrupt("return", canonical + tail);
    case 17:
      i++;
      $ctx4.next = 3;
      break;
    case 20:
    case "end":
      return $ctx4.stop();
    }
  }, this);
});

/**
 * Split reference name.
 * 
 * @param  {String} target
 * @return {Array}
 */
function tofrags (target) {
  var frags = target.split('/');
  var head = frags[0].toLowerCase();
  var tail = frags.length > 1
    ? frags.slice(1).join('/')
    : '';
  return [head, tail];
}
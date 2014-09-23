
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


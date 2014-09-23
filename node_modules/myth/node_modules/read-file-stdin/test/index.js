
var assert = require('assert');
var read = require('..');
var Stream = require('stream').Readable;

describe('read-file-stdin', function () {
  it('should read from a file', function (done) {
    read(__dirname + '/fixture.txt', function (err, buffer) {
      assert('test' == buffer.toString());
      done();
    });
  });

  it('should read from stdin', function (done) {
    process.stdin = new Stream();

    read(function (err, buffer) {
      assert('test' == buffer.toString());
      done();
    });

    process.stdin.emit('data', new Buffer('test'));
    process.stdin.emit('end');
  });
});
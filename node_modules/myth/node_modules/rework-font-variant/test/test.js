
var fs = require('fs');
var path = require('path');
var rework = require('rework');
var variants = require('..');

var input = fixture('input');
var output = fixture('output');

describe('rework-font-variant', function () {
  it('should work', function () {
    var css = rework(input)
      .use(variants)
      .toString()
      .trim();
    css.should.equal(output);
  });
});


/**
 * Read a fixture by file `name`.
 *
 * @param {String} filename
 */

function fixture (name) {
  return fs.readFileSync(path.resolve(__dirname, name + '.css'), 'utf8').trim();
}
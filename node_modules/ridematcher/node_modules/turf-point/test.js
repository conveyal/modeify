var test = require('tape');
var point = require('./');

test('point', function(t){
  var ptArray = point([5, 10], {name: 'test point'});

  t.ok(ptArray);
  t.equal(ptArray.geometry.coordinates[0], 5);
  t.equal(ptArray.geometry.coordinates[1], 10);
  t.equal(ptArray.properties.name, 'test point');

  t.throws(function() {
      point('hey', 'invalid');
  }, 'numbers required');

  var noProps = point([0, 0]);
  t.deepEqual(noProps.properties, {}, 'no props becomes {}');

  t.end();
});

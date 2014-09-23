
var join = require('..');

describe('join(arr)', function(){
  it('should default to "and"', function(){
     join(['foo', 'bar']).should.equal('foo and bar');
  })
})

describe('join(arr, str)', function(){
  it('should join', function(){
     join([], 'and').should.equal('');
     join(['foo'], 'and').should.equal('foo');
     join(['foo', 'bar'], 'and').should.equal('foo and bar');
     join(['foo', 'bar', 'raz'], 'or').should.equal('foo, bar or raz');
  })
})

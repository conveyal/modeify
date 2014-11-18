var co = require('co')

var request = require('..')

var uri = 'https://raw.github.com/component/domify/84b1917ea5a9451f5add48c5f61e477f2788532b/component.json'

describe('buffer', function () {
  it('should buffer the response', co(function* () {
    var res = yield* request(uri, {
      buffer: true
    })
    res.statusCode.should.equal(200)
    res.buffer.should.be.a.Buffer
  }))

  it('should not buffer the response on HEAD requests', co(function* () {
    var res = yield* request(uri, {
      method: 'HEAD',
      buffer: true
    })
    res.statusCode.should.equal(200)
    res.should.not.have.property('buffer')
  }))

  it('should buffer the response as a string', co(function* () {
    var res = yield* request(uri, {
      string: true
    })
    res.statusCode.should.equal(200)
    res.text.should.be.a.String
  }))

  it('should buffer the response as a string and buffer', co(function* () {
    var res = yield* request(uri, {
      buffer: true,
      string: true
    })
    res.statusCode.should.equal(200)
    res.buffer.should.be.a.Buffer
    res.text.should.be.a.String
  }))

  it('should parse JSON', co(function* () {
    var res = yield* request(uri, true)
    res.statusCode.should.equal(200)
    res.headers['content-encoding'].should.equal('gzip')
    res.text.should.be.a.String
    res.body.name.should.equal('domify')
  }))
})
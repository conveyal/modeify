var co = require('co')
var os = require('os')
var fs = require('fs')
var path = require('path')
var http = require('http')
var setup = require('proxy')

var request = require('..')

var tmpdir = os.tmpdir()
var uri = 'https://raw.github.com/component/domify/84b1917ea5a9451f5add48c5f61e477f2788532b/component.json'
var redirect = 'https://raw.github.com/jonathanong/inherits/master/component.json'

var server = setup(http.createServer())

describe('cogent', function () {
  it('should work with HTTPS', co(function* () {
    var res = yield* request(uri)
    res.statusCode.should.equal(200)
    res.headers['content-encoding'].should.equal('gzip')
    res.resume()
  }))

  it('should start proxy server', function (done) {
    server.listen(4205, done)
  })

  it('should work with HTTP proxy', co(function* () {
    var res = yield* request(uri, {
      proxy: 'http://localhost:4205'
    })
    res.statusCode.should.equal(200)
    res.headers['content-encoding'].should.equal('gzip')
    res.resume()
  }))

  it('should save to a file', co(function* () {
    var destination = path.join(tmpdir, Math.random().toString(36).slice(2))
    var res = yield* request(uri, destination)
    res.statusCode.should.equal(200)
    res.destination.should.equal(destination)
    fs.statSync(destination)
  }))

  it('should resolve redirects', co(function* () {
    var res = yield* request(redirect, true)
    res.urls.length.should.equal(2)
    res.statusCode.should.equal(200)
    res.body.name.should.equal('inherits')
  }))

  it('should not resolve redirects', co(function* () {
    var res = yield* request(redirect, {string: true, redirects: 0, method: 'GET'})
    res.statusCode.should.equal(301)
  }))

  it('should work with retries', co(function* () {
    var res = yield* request(uri, {
      retries: 2
    })
    res.statusCode.should.equal(200)
    res.headers['content-encoding'].should.equal('gzip')
    res.resume()
  }))
})

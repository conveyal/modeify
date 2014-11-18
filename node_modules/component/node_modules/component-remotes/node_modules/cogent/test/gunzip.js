var co = require('co')
var http = require('http')
var assert = require('assert')

var request = require('..')

var uri = 'https://raw.github.com/component/domify/84b1917ea5a9451f5add48c5f61e477f2788532b/component.json'

describe('when gunzip=false', function () {
  it('should return an uncompressed stream', co(function* () {
    var res = yield* request(uri, {
      gunzip: false
    })
    assert.ok(res instanceof http.IncomingMessage)
  }))

  it('should return an uncompressed stream with HTTP proxy', co(function* () {
    var res = yield* request(uri, {
      gunzip: false,
      proxy: 'http://localhost:4205'
    })
    assert.ok(res instanceof http.IncomingMessage)
  }))  

  it('should throw if buffering the response', co(function* () {
    try {
      var res = yield* request(uri, {
        gunzip: false,
        buffer: true
      })
      throw new Error('boom')
    } catch (err) {
      err.message.should.not.equal('boom')
    }
  }))
})
var log = require('../log')('route-resource')
var request = require('../request')

exports.findByTags = function (tags, callback) {
  log('finding resources that match %j', tags)
  request.get('/route-resources', {
    tags: tags.join(',')
  }, function (err, res) {
    if (err || !res.body) {
      callback('No resources found.')
    } else {
      callback(null, res.body)
    }
  })
}

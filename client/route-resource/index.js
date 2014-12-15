var log = require('log')('route-resources');
var request = require('request');

exports.findByTags = function(tags, callback) {
  log('finding resources that match %j', tags);
  request.get('/route-resources', {
    tags: tags.join(',')
  }, callback);
};

var async = require('async');
var mongoose = require('../../lib/mongo');

module.exports = function(callback) {
  if (process.env.NODE_ENV !== 'test') return callback();
  async.each(['Commuter', 'Organization', 'User'], function(name, done) {
    mongoose.model(name).remove({}, done);
  }, callback);
};

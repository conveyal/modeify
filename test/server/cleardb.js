var async = require('async');
var mongoose = require('../../lib/mongo');

module.exports = function(callback) {
  if (process.env.NODE_ENV !== 'test') return callback();
  async.each([ 'commuters', 'organizations', 'users' ], function(collection, done) {
    mongoose.connection.collections[collection].drop(done);
  }, callback);
};

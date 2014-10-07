var async = require('async');
var mongoose = require('../../lib/mongo');

module.exports = function(callback) {
  if (process.env.NODE_ENV !== 'test') return callback();
  async.each([ 'commuters', 'organizations', 'users' ], function(name, done) {
    var collection = mongoose.connection.collections[name];
    if (collection) collection.drop(done);
  }, callback);
};

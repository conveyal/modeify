var Batch = require('batch');
var Commuter = require('./model');

/**
 * Update status
 */

module.exports.updateStatus = function(callback) {
  var batch = new Batch();
  Commuter.find(function(err, commuters) {
    if (err) return callback(err);
    commuters.forEach(function(commuter) {
      batch.push(function(done) {
        commuter.updateStatus(done);
      });
    });
    callback(null, batch);
  });
};

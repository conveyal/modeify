var Batch = require('batch');
var Email = require('./model');

/**
 * Expose `process`
 */

module.exports = function(callback) {
  Email.find(function(err, emails) {
    if (err) return callback(err);
    var batch = new Batch();
    emails.forEach(function(email) {
      batch.push(function(done) {
        email.syncWithMandrill(done);
      });
    });
    callback(null, batch);
  });
};

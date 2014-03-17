var Batch = require('batch');
var Email = require('./model');
var mandrill = require('../mandrill');

/**
 * Expose `process`
 */

module.exports = function(callback) {
  Email.find(function(err, emails) {
    if (err) return callback(err);
    var batch = new Batch();
    emails.forEach(function(email) {
      batch.push(function(done) {
        update(email, done);
      });
    });
    callback(null, batch);
  });
};

/**
 * Update each email with the latest metadata from Mandrill
 */

function update(email, callback) {
  mandrill.info(email.result._id, function(err, data) {
    if (err) return callback(err);
    email.result = data;
    email.save(callback);
  });
}

var Batch = require('batch');
var Email = require('./model');
var log = require('../log');

/**
 * Expose `batches`
 */

module.exports = {
  handleMandrillEvents: handleMandrillEvents,
  syncAllWithMandrill: syncAllWithMandrill
};

/**
 * Handle all Mandrill events
 */

function handleMandrillEvents(events, callback) {
  var batch = new Batch();

  events.forEach(function(evnt) {
    batch.push(function(done) {
      log.info('processing mandrill event', evnt);
      Email
        .findOne()
        .where('result._id', evnt._id)
        .populate('_commuter')
        .exec(function(err, email) {
          if (err || !email) {
            done(err);
          } else {
            email.events = email.events || [];
            email.events.push(evnt);
            email.save(function(err) {
              if (err) {
                done(err);
              } else {
                email.updateCommuter(done);
              }
            });
          }
        });
    });
  });

  callback(null, batch);
}

/**
 * Loop through all emails and query Mandrill API for latest data
 */

function syncAllWithMandrill(callback) {
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
}

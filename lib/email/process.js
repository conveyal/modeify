var Batch = require('batch')
var Email = require('./model')
var log = require('../log')

module.exports.handleSparkEvents = function handleSparkEvents (events, callback) {
  var batch = new Batch()

  events.forEach(function (evnt) {
    batch.push(function (done) {
      log.info('processing spark event', evnt)
      Email
        .findOne()
        .where('result._id', evnt._id)
        .populate('_commuter')
        .exec(function (err, email) {
          if (err || !email) {
            done(err)
          } else {
            email.events = email.events || []
            email.events.push(evnt)
            email.save(function (err) {
              if (err) {
                done(err)
              } else {
                email.updateCommuter(done)
              }
            })
          }
        })
    })
  })

  callback(null, batch)
}

/**
 * Loop through all emails and query Spark API for latest data
 */

module.exports.syncAllWithSpark = function syncAllWithSpark (callback) {
  Email.find(function (err, emails) {
    if (err) return callback(err)
    var batch = new Batch()
    emails.forEach(function (email) {
      batch.push(function (done) {
        email.syncWithSpark(done)
      })
    })
    callback(null, batch)
  })
}

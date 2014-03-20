var express = require('express');
var handleMandrillEvents = require('./email/process');
var log = require('./log');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Mandrill
 */

app.post('/mandrill', function(req, res) {
  // TODO: Authenticate requests
  handleMandrillEvents(req.body.mandrill_events, function(err, batch) {
    batch.on('end', function(err) {
      if (err) {
        log.error(err);
        res.send(400);
      } else {
        res.send(200);
      }
    });
  });
});

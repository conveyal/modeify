var Email = require('./email/model');
var express = require('express');
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
  Email.processEvents(req.body.mandrill_events, function(err, res) {
    if (err) {
      log.error(err);
      res.send(400);
    } else {
      res.send(200);
    }
  });
});

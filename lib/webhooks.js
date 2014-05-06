var express = require('express');
var handleMandrillEvents = require('./email/process').handleMandrillEvents;
var log = require('./log');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Mandrill
 */

router.post('/mandrill', function(req, res) {
  // TODO: Authenticate requests
  var events = req.body.mandrill_events;
  if (!Array.isArray(events)) events = JSON.parse(events);

  handleMandrillEvents(events, function(err, batch) {
    batch.end(function(err) {
      if (err) {
        log.error(err);
        res.send(400, err);
      } else {
        res.send(200);
      }
    });
  });
});

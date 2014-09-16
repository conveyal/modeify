var auth = require('../auth');
var express = require('express');
var Feedback = require('./model');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Get all of the feedback
 */

router.get('/', function(req, res) {
  Feedback
    .find()
    .populate('_journey')
    .exec(function(err, feedback) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(feedback);
      }
    });
});

/**
 * Create feedback
 */

router.post('/', auth.isLoggedIn, function(req, res) {
  var data = req.body;
  data.created_by = req.session.user._id;

  Feedback.create(req.body, function(err, feedback) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(feedback);
    }
  });
});

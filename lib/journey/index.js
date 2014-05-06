var auth = require('../auth');
var express = require('express');
var Journey = require('./model');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Get all of a commuters journeys
 */

router.get('/', auth.isLoggedIn, function(req, res) {
  Journey
    .find({
      created_by: req.session.user._id,
      destroyed: false
    })
    .populate('locations')
    .exec(function(err, journey) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, journey);
      }
    });
});

/**
 * Create a Journey
 */

router.post('/', auth.isLoggedIn, function(req, res) {
  var data = req.body;
  data.created_by = req.session.user._id;

  Journey.generate(req.body, function(err, journey) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, journey);
    }
  });
});

/**
 * Get a Journey
 */

router.get('/:id', auth.isLoggedIn, findById, function(req, res) {
  res.send(200, req.journey);
});

/**
 * Remove
 */

router.delete('/:id', auth.isLoggedIn, findById, function(req, res) {
  req.journey.destroyed = true;
  req.journey.save(function(err) {
    if (err) {
      res.send(400, 'Failed to remove journey.');
    } else {
      res.send(204);
    }
  });
});

/**
 * Find by id
 */

function findById(req, res, next) {
  Journey.findById(req.params.id, function(err, journey) {
    if (err) {
      res.send(400, err);
    } else if (!journey || journey.destroyed === true) {
      res.send(404, 'Journey does not exist.');
    } else {
      req.journey = journey;
      next();
    }
  });
}

var auth = require('../auth'); // TODO: Auth all requests
var express = require('express');
var Location = require('./model');

/**
 * Expose `router`
 */

var router = module.exports = express.Router();

/**
 * Create
 */

router.post('/', function(req, res) {
  Location.create({
    address: req.body.address,
    category: req.body.category,
    created_by: req.session.user._id,
    name: req.body.name
  }, function(err, location) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(201, location);
    }
  });
});

/**
 * Get
 */

router.get('/:id', findById, function(req, res) {
  res.send(200, req.location);
});

/**
 * Update
 */

router.put('/:id', function(req, res) {
  req.location.category = req.body.category;
  req.location.name = req.body.name;
  req.location.save(function(err, location) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, location);
    }
  });
});

/**
 * Find by id middleware
 */

function findById(req, res, next) {
  Location.findById(req.params.id, function(err, location) {
    if (err) {
      res.send(400, err);
    } else if (!location) {
      res.send(404, 'Location does not exist.');
    } else {
      req.location = location;
      next();
    }
  });
}

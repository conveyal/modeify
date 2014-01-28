/**
 * Dependencies
 */

var auth = require('../auth');
var express = require('express');
var Org = require('./model');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Get all orgs
 */

app.get('/', auth.isLoggedIn, function(req, res) {
  Org.find().exec(function(err, orgs) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, orgs);
    }
  });
});

/**
 * Create an org
 */

app.post('/', auth.isLoggedIn, function(req, res) {
  Org.create(req.body, function(err, org) {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.send(409, new Error('Resource exists with that information.'));
      } else {
        res.send(400, err);
      }
    } else {
      res.send(201, org);
    }
  });
});

/**
 * Middleware to retrieve an org by id
 */

function get(req, res, next) {
  Org.findById(req.params.id).exec(function(err, org) {
    if (err) {
      res.send(400, err);
    } else if (!org) {
      res.send(404, 'Org does not exist.');
    } else {
      req.organization = org;
      next();
    }
  });
}

/**
 * Get a specific org
 */

app.get('/:id', auth.isLoggedIn, get, function(req, res) {
  res.send(200, req.organization);
});

/**
 * Update an org
 */

app.put('/:id', auth.isLoggedIn, get, function(req, res) {
  req.organization.name = req.body.name;
  req.organization.address = req.body.address;
  req.organization.save(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

/**
 * Delete an org
 */

app.delete('/:id', auth.isLoggedIn, get, function(req, res) {
  req.organization.remove(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

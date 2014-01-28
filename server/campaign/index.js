/**
 * Dependencies
 */

var auth = require('../auth');
var express = require('express');
var Campaign = require('./model');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Get all campaigns
 */

app.get('/', auth.isLoggedIn, function(req, res) {
  Campaign
    .find()
    .exec(function(err, campaigns) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, campaigns);
      }
    });
});

/**
 * Create an campaign
 */

app.post('/', auth.isLoggedIn, function(req, res) {
  Campaign.create(req.body, function(err, campaign) {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.send(409, new Error('Resource exists with that information.'));
      } else {
        res.send(400, err);
      }
    } else {
      res.send(201, campaign);
    }
  });
});

/**
 * Middleware to retrieve an campaign by id
 */

function get(req, res, next) {
  Campaign
    .findById(req.params.id)
    .exec(function(err, campaign) {
      if (err) {
        res.send(400, err);
      } else if (!campaign) {
        res.send(404, 'Campaign does not exist.');
      } else {
        req.campaign = campaign;
        next();
      }
    });
}

/**
 * Get a specific campaign
 */

app.get('/:id', auth.isLoggedIn, get, function(req, res) {
  res.send(200, req.campaign);
});

/**
 * Update an campaign
 */

app.put('/:id', auth.isLoggedIn, get, function(req, res) {
  req.campaign.filters = req.body.filters;
  req.campaign.status = req.body.status;
  req.campaign.save(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

/**
 * Delete an campaign
 */

app.delete('/:id', auth.isLoggedIn, get, function(req, res) {
  req.campaign.remove(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

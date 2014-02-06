/**
 * Dependencies
 */

var auth = require('../auth');
var express = require('express');
var Commuter = require('./model');

/**
 * Expose `app`
 */

var app = module.exports = express()
  .use(auth.isLoggedIn);

/**
 * Get all commuters
 */

app.get('/', function(req, res) {
  Commuter
    .find(req.query)
    .exec(function(err, commuters) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, commuters);
      }
    });
});

/**
 * Create an commuter
 */

app.post('/', function(req, res) {
  Commuter.create(req.body, function(err, commuter) {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.send(409, new Error('Resource exists with that information.'));
      } else {
        res.send(400, err);
      }
    } else {
      res.send(201, commuter);
    }
  });
});

/**
 * Middleware to retrieve an commuter by id
 */

function get(req, res, next) {
  Commuter
    .findById(req.params.id)
    .exec(function(err, commuter) {
      if (err) {
        res.send(400, err);
      } else if (!commuter) {
        res.send(404, 'Commuter does not exist.');
      } else {
        req.commuter = commuter;
        next();
      }
    });
}

function getWithOrg(req, res, next) {
  Commuter
    .findById(req.params.id)
    .populate('_organization')
    .exec(function(err, commuter) {
      if (err) {
        res.send(400, err);
      } else if (!commuter) {
        res.send(404, 'Commuter does not exist.');
      } else {
        req.commuter = commuter;
        next();
      }
    });
}

/**
 * Get a specific commuter
 */

app.get('/:id', get, function(req, res) {
  res.send(200, req.commuter);
});

/**
 * Update an commuter
 */

app.put('/:id', get, function(req, res) {
  req.commuter.name = req.body.name;
  req.commuter.address = req.body.address;
  req.commuter.state = req.body.state;
  req.commuter.city = req.body.city;
  req.commuter.zip = parseInt(req.body.zip, 10);
  req.commuter.labels = req.body.labels;
  req.commuter.opts = req.body.opts;
  req.commuter.coordinate = req.body.coordinate;
  req.commuter.link = req.body.link;
  req.commuter.save(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

/**
 * Send a plan
 */

app.post('/:id/send-plan', getWithOrg, function(req, res) {
  req.commuter.sendPlan(function(err, email) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(201, email);
    }
  });
});

/**
 * Delete an commuter
 */

app.delete('/:id', get, function(req, res) {
  req.commuter.remove(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

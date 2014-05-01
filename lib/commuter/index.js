var auth = require('../auth');
var express = require('express');
var Commuter = require('./model');
var User = require('../user/model');

/**
 * Expose `app`
 */

var app = module.exports = express.Router();

/**
 * Get all commuters
 */

app.get('/', auth.isLoggedIn, function(req, res) {
  Commuter
    .querystring(req.query)
    .populate('_user', 'email')
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

app.post('/', auth.isLoggedIn, function(req, res) {
  var commuterData = req.body || {};
  var userData = req.body._user || {};
  userData.type = 'commuter';

  User.findOrCreate(userData, function(err, user) {
    if (err) {
      res.send(400, err);
    } else {
      commuterData._user = user._id;
      Commuter.create(commuterData, function(err, commuter) {
        if (err) {
          res.send(400, err);
        } else {
          commuter.populate('_user', function(err) {
            if (err) {
              res.send(400, err);
            } else {
              commuter.sendPlan(function(err) {
                if (err) {
                  res.send(400, err);
                } else {
                  res.send(201, commuter);
                }
              });
            }
          });
        }
      });
    }
  });
});

/**
 * Get with a link
 */

app.get('/link/:link', function(req, res) {
  Commuter
    .findOne()
    .where('link', req.params.link)
    .populate('_organization')
    .populate('_user', 'email')
    .exec(function(err, commuter) {
      if (err) {
        res.send(400, err);
      } else if (!commuter) {
        res.send(404, 'Commuter does not exist for link.');
      } else {
        res.send(200, commuter);
      }
    });
});

/**
 * Middleware to retrieve an commuter by id
 */

function get(req, res, next) {
  Commuter
    .findById(req.params.id)
    .populate('_user', 'email')
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
    .populate('_user', 'email')
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

app.get('/:id', auth.isLoggedIn, get, function(req, res) {
  res.send(200, req.commuter);
});

/**
 * Update an commuter
 */

app.put('/:id', auth.isLoggedIn, get, function(req, res) {
  if (req.session.commuter && req.session.commuter._id !== req.params.id)
    return res.send(403, 'Cannot change other commuters.');

  for (var key in req.body) {
    if (key === '_user' || key === '_organization') continue;
    req.commuter[key] = req.body[key];
  }

  req.commuter.save(function(err, commuter) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, commuter);
    }
  });
});

/**
 * Send a plan
 */

app.post('/:id/send-plan', auth.isLoggedIn, getWithOrg, function(req, res) {
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

app.delete('/:id', auth.isLoggedIn, get, function(req, res) {
  req.commuter.remove(function(err) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(204);
    }
  });
});

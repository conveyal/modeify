var cookieSession = require('cookie-session');
var express = require('express');
var toSlugCase = require('to-slug-case');
var uuid = require('node-uuid');

var config = require('../config');
var Commuter = require('../commuter/model');
var User = require('../user/model');

/**
 * Turn application name into a slug
 */

var slug = toSlugCase(config.application);

/**
 * Cookie data
 */

var cookieKey = slug + '.' + process.env.NODE_ENV;
var cookieSecret = process.env.COOKIE_SECRET + '.' + cookieKey;
var thirtyDays = 2592000000; // 30 days in ms

/**
 * Expose `app`
 */

var app = module.exports = express.Router()
  .use(cookieSession({
    httpOnly: false,
    key: cookieKey,
    maxage: thirtyDays,
    secret: cookieSecret
  }));

/**
 * Expose `isAdmin`, `isLoggedIn`
 */

module.exports.isAdmin = isAdmin;
module.exports.isLoggedIn = isLoggedIn;

/**
 * Set
 */

app.all('*', function(req, res, next) {
  if (req.signedCookies && req.signedCookies[cookieKey] && req.signedCookies[
    cookieKey].user) {
    req.session.user = req.signedCookies[cookieKey].user;
    req.session.commuter = req.signedCookies[cookieKey].commuter;
  }
  next();
});

/**
 * Login
 */

app.post('/login', function(req, res) {
  User
    .findOne()
    .where('email', req.body.email)
    .select('email password type')
    .exec(function(err, user) {
      if (err) {
        res.status(400).send(err);
      } else if (!user) {
        res.status(404).send('Incorrect email.');
      } else {
        user.comparePassword(req.body.password, function(err, same) {
          if (err) {
            res.status(400).send(err);
          } else if (!same) {
            res.status(400).send('Incorrect password.');
          } else {
            // convert to JSON and delete password
            user = user.toJSON();
            delete user.password;

            // save in session
            req.session.user = user;
            res.status(200).send(user);
          }
        });
      }
    });
});

/**
 * Commuter Login
 */

app.post('/commuter-login', function(req, res) {
  User
    .findOne()
    .where('email', req.body.email)
    .select('email password type')
    .exec(function(err, user) {
      if (err) {
        res.status(400).send(err);
      } else if (!user) {
        res.status(404).send('Incorrect email.');
      } else {
        user.comparePassword(req.body.password, function(err, same) {
          if (err || !same) {
            res.status(400).send('Incorrect password.');
          } else {
            // convert to JSON and delete password
            user = user.toJSON();
            delete user.password;

            // save in session
            req.session.user = user;
            Commuter
              .findOne()
              .where('_user', user._id)
              .populate('_organization')
              .populate('_user', 'email type')
              .exec(function(err, commuter) {
                if (err) {
                  res.status(400).send(err);
                } else if (!commuter) {
                  res.status(404).send('No commuter!');
                } else {
                  req.session.commuter = commuter.toJSON();
                  res.status(200).send(commuter);
                }
              });
          }
        });
      }
    });
});

/**
 * Login with link
 */

app.get('/login/:link', function(req, res) {
  Commuter
    .findOne()
    .where('link', req.params.link)
    .populate('_organization')
    .populate('_user', 'email type')
    .exec(function(err, commuter) {
      if (err) {
        res.status(400).send(err);
      } else if (!commuter) {
        res.status(404).send('Incorrect link.');
      } else {
        req.session.user = commuter._user && commuter._user.toJSON();
        req.session.commuter = commuter.toJSON();

        res.status(200).send(commuter);
      }
    });
});

/**
 * Login anonymously
 */

app.get('/login-anonymously', function(req, res) {
  var email = 'anonymous+' + uuid.v4().replace(/-/g, '') + '@' + config.domain;

  Commuter.generate({
    anonymous: true,
    email: email
  }, {}, function(err, commuter) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      req.session.user = commuter._user.toJSON();
      req.session.commuter = commuter.toJSON();

      delete req.session.user.password;
      delete req.session.commuter._user.password;

      res.status(200).send({
        anonymous: true,
        _id: commuter._id,
        _user: {
          _id: commuter._user._id,
          email: commuter._user.email,
          type: commuter._user.type
        }
      });
    }
  });
});

/**
 * Logout
 */

app.all('/logout', logout, function(req, res) {
  res.status(204).end();
});

/**
 * Check if logged in
 */

app.all('/is-logged-in', isLoggedIn, function(req, res) {
  res.status(200).send(req.session.user);
});

/**
 * Commuter is logged in?
 */

app.all('/commuter-is-logged-in', isLoggedIn, function(req, res) {
  res.status(200).send(req.session.commuter);
});

/**
 * Check if a user is logged in
 */

function isLoggedIn(req, res, next) {
  if (req.session.user || req.session.commuter) {
    next();
  } else {
    logout(req, res);
    res.status(401).send('Must be logged in.');
  }
}

/**
 * Is admin?
 */

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.type ===
    'administrator') {
    next();
  } else {
    res.status(401).send('Administrators only.');
  }
}

/**
 * Logout
 */

function logout(req, res, next) {
  res.clearCookie('commuter');
  res.clearCookie('user');
  res.clearCookie();
  req.session = null;
  if (next) next();
}

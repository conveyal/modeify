var cookieParser = require('cookie-parser');
var config = require('../config');
var express = require('express');
var Commuter = require('../commuter/model');
var session = require('express-session');
var toSlugCase = require('to-slug-case');
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

var app = module.exports = express()
  .use(cookieParser(cookieSecret))
  .use(session({
    secret: cookieSecret,
    key: cookieKey,
    cookie: {
      maxAge: thirtyDays,
      httpOnly: false
    }
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
        res.send(400, err);
      } else if (!user) {
        res.send(404, 'Incorrect email.');
      } else {
        user.comparePassword(req.body.password, function(err, same) {
          if (err) {
            res.send(400, err);
          } else if (!same) {
            res.send(400, 'Incorrect password.');
          } else {
            // convert to JSON and delete password
            user = user.toJSON();
            delete user.password;

            // save in session
            req.session.user = user;
            res.send(200, user);
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
    .populate('_user', '_id email type')
    .exec(function(err, commuter) {
      if (err) {
        res.send(400, err);
      } else if (!commuter) {
        res.send(404, 'Incorrect link.');
      } else {
        req.session.user = commuter._user.toJSON();
        req.session.commuter = commuter.toJSON();

        res.send(200, commuter);
      }
    });
});

/**
 * Logout
 */

app.all('/logout', logout, function(req, res) {
  res.send(204);
});

/**
 * Check if logged in
 */

app.all('/is-logged-in', isLoggedIn, function(req, res) {
  res.send(200, req.session.user);
});

/**
 * Commuter is logged in?
 */

app.all('/commuter-is-logged-in', isLoggedIn, function(req, res) {
  res.send(200, req.session.commuter);
});

/**
 * Check if a user is logged in
 */

function isLoggedIn(req, res, next) {
  if (req.session.user || req.session.commuter) {
    next();
  } else {
    logout(req, res);
    res.send(401, 'Must be logged in.');
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
    res.send(401, 'Administrators only.');
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

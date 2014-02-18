/**
 * Dependencies
 */

var express = require('express');
var User = require('../user/model');

/**
 * Cookie data
 */

var cookieSecret = process.env.COOKIE_SECRET + '.commute-planner.' + process.env
  .NODE_ENV;
var cookieKey = 'commute-planner.' + process.env.NODE_ENV;
var thirtyDays = 2592000000; // 30 days in ms

/**
 * Expose `app`
 */

var app = module.exports = express()
  .use(express.cookieParser(cookieSecret))
  .use(express.cookieSession({
    secret: cookieSecret,
    key: cookieKey,
    cookie: {
      maxAge: thirtyDays,
      httpOnly: false
    }
  }));

/**
 * Expose `isAdmin`
 */

module.exports.isAdmin = isAdmin;

/**
 * Expose `isLoggedin`
 */

module.exports.isLoggedIn = isLoggedIn;

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
            res.cookie('user', user._id, {
              signed: true
            });
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
 * Check if a user is logged in
 */

function isLoggedIn(req, res, next) {
  if (req.signedCookies && req.signedCookies[cookieKey] && req.signedCookies[
    cookieKey].user) {
    req.session.user = req.signedCookies[cookieKey].user;
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
  if (req.session && req.session.user && req.session.user.type === 'administrator') {
    next();
  } else {
    res.send(401, 'Administrators only.');
  }
}

/**
 * Logout
 */

function logout(req, res, next) {
  res.clearCookie('user');
  req.session = null;
  if (next) next();
}

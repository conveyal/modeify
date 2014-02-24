/**
 * Dependencies
 */

var auth = require('./auth');
var express = require('express');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Mount routes
 */

app.use(auth);
app.use('/campaigns', require('./campaign'));
app.use('/commuters', require('./commuter'));
app.use('/events', require('./event'));
app.use('/emails', require('./email'));
app.use('/geocode', require('./geocode'));
app.use('/links', require('./link'));
app.use('/organizations', require('./organization'));
app.use('/otp', require('./otp'));
app.use('/users', require('./user'));

/**
 * Dependencies
 */

var express = require('express');

/**
 * Expose `app`
 */

var app = module.exports = express();

/**
 * Mount routes
 */

app.use(require('./auth'));
app.use('/campaigns', require('./campaign'));
app.use('/commuters', require('./commuter'));
app.use('/events', require('./event'));
app.use('/emails', require('./email'));
app.use('/links', require('./link'));
app.use('/organizations', require('./organization'));
app.use('/users', require('./user'));

/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * URL
 */

var url = process.env.MONGODB_URL ||
  'mongodb://localhost:27017/commute-planner-' + process.env.NODE_ENV;

/**
 * Connect
 */

mongoose.connect(url, {
  server: {
    socketOptions: {
      keepAlive: 1
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 1
    }
  }
});

/**
 * Expose `mongoose`
 */

module.exports = mongoose;

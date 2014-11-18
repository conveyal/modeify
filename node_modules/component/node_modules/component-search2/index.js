module.exports = require('generator-supported')
  ? require('./node/search')
  : require('./build/search');
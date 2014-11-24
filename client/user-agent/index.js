var UAParser = require('ua-parser-js');
var parser = new UAParser();

module.exports = parser.getResult();

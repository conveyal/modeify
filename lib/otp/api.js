var auth = require('../auth');
var config = require('../config');
var express = require('express');
var log = require('../log');
var http = require('http');

/**
 * Expose `app`
 */

var app = module.exports = express.Router();

/**
 * Proxy
 */

app.all('*', function(req, res) {
  var options = {
    host: config.otp.host,
    method: 'GET',
    path: config.otp.path + req.url,
    port: config.otp.port
  };

  var creq = http.request(options, function(cres) {
    cres.setEncoding('utf8');

    var data = '';
    cres.on('data', function(chunk) {
      data += chunk;
    });

    cres.on('end', function() {
      try {
        JSON.parse(data);
      } catch (e) {
        log.error(e);
        data = {
          id: data,
          options: [],
          routeId: '',
          stops: [],
          error: e
        };
      }

      if (req.query.callback) {
        res.type('text/javascript');
        res.send(200, data);
      } else {
        res.type('application/json');
        res.send(200, data);
      }
    });

  }).on('error', function(e) {
    res.send(500, e);
  });

  creq.end();
});

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
      if (cres.statusCode !== 200) {
        log.error('otp:error', {
          message: data,
          statusCode: res.statusCode,
          url: config.otp.path + req.url
        });
        res.status(400).send(data);
      } else {
        try {
          JSON.parse(data);
        } catch (e) {
          log.error(data);
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
          res.status(200).send(data);
        } else {
          res.type('application/json');
          res.status(200).send(data);
        }
      }
    });

  }).on('error', function(e) {
    res.status(500).send(e);
  });

  creq.end();
});

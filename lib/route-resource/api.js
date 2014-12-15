var express = require('express');
var RouteResource = require('./model');

var router = module.exports = express.Router();

router.get('/', function(req, res) {
  if (req.query.tags) {
    RouteResource.findByTags(req.query.tags, function(err, resources) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, resources);
      }
    });
  } else {
    RouteResource
      .find()
      .exec(function(err, resources) {
        if (err) {
          res.send(400, err);
        } else {
          res.send(200, resources);
        }
      });
  }
});
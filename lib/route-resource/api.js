var express = require('express');
var RouteResource = require('./model');

var router = module.exports = express.Router();

router.get('/', function(req, res) {
  if (req.query.tags) {
    RouteResource.findByTags(req.query.tags, function(err, resources) {
      if (err) {
        res
          .status(400)
          .send(err);
      } else {
        res
          .status(200)
          .send(resources);
      }
    });
  } else {
    RouteResource
      .find()
      .exec(function(err, resources) {
        if (err) {
          res
            .status(400)
            .send(err);
        } else {
          res
            .status(200)
            .send(resources);
        }
      });
  }
});
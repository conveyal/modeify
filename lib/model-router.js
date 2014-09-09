var express = require('express');

/**
 * Expose `model` router
 */

module.exports = modelRouter;

/**
 * Default model router
 *
 * @param {Object} opts
 *   - @param {Array} middleware
 *   - @param {Object} model
 * @param {Function} fn
 *   - @param {Router} router
 *   - @param {Function} byId
 */

function modelRouter(opts, fn) {
  var router = express.Router();
  var middleware = opts.middleware || [];
  var Model = opts.model;
  var name = opts.name || Model.modelName;
  var slug = opts.slug || name.toLowerCase();

  // Get model by id
  var byId = function byId(req, res, next) {
    Model.findById(req.params.id, function(err, model) {
      if (err) {
        res.send(400, err);
      } else if (!model) {
        res.send(404, Model.modelName + ' does not exist.');
      } else {
        req[slug] = model;
        next();
      }
    });
  };

  // Load all middleware
  middleware.forEach(function(ware) {
    router.use(ware);
  });

  // Get the base routes
  fn(router, byId);

  // Default get all
  router.get('/', function(req, res) {
    Model.find(function(err, models) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, models);
      }
    });
  });

  // Default create
  router.post('/', function(req, res) {
    Model.create(req.body, function(err, model) {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          res.send(409, new Error('Resource exists with that information.'));
        } else {
          res.send(400, err);
        }
      } else {
        res.send(201, model);
      }
    });
  });

  // Default get one
  router.get('/:id', byId, function(req, res) {
    res.send(200, req[slug]);
  });

  // Default update
  router.put('/:id', byId, function(req, res) {
    for (var param in req.body) {
      req[slug][param] = req.body[param];
    }

    req[slug].save(function(err, model) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, model);
      }
    });
  });

  // Default delete
  router.delete('/:id', byId, function(req, res) {
    req[slug].remove(function(err) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(204);
      }
    });
  });

  return router;
}

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
 */

function modelRouter(opts) {
  var router = express.Router();
  var middleware = opts.middleware || [];
  var Model = opts.model;
  var name = Model.modelName.toLowerCase();

  // Get model by id
  var byId = function byId(req, res, next) {
    Model.findById(req.params.id, function(err, model) {
      if (err) {
        res.send(400, err);
      } else if (!model) {
        res.send(404, Model.modelName + ' does not exist.');
      } else {
        req[name] = model;
        next();
      }
    });
  };

  // Load all middleware
  middleware.forEach(function(ware) {
    router.use(ware);
  });

  /**
   * Read
   */

  router.get('/', function(req, res) {
    Model.find(function(err, models) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, models);
      }
    });
  });

  /**
   * Create
   */

  router.post('/', function(req, res) {
    Model.create(req.body, function(err, model) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(201, model);
      }
    });
  });

  /**
   * Read by id
   */

  router.get('/:id', byId, function(req, res) {
    res.send(200, req[name]);
  });

  /**
   * Update by id
   */

  router.put('/:id', byId, function(req, res) {
    for (var param in req.body) {
      req[name][param] = req.body[param];
    }

    req[name].save(function(err, model) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, model);
      }
    });
  });

  /**
   * Delete by id
   */

  router.del('/:id', byId, function(req, res) {
    req[name].remove(function(err) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(204);
      }
    });
  });

  return router;
}

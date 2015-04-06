var express = require('express')

/**
 * Expose `model` router
 */

module.exports = modelRouter

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

function modelRouter (opts, fn) {
  var router = express.Router()
  var middleware = opts.middleware || []
  var Model = opts.model
  var name = opts.name || Model.modelName
  var slug = opts.slug || name.toLowerCase()

  // Get model by id
  var byId = function byId (req, res, next) {
    Model.findById(req.params.id, function (err, model) {
      if (err) {
        res.status(400).send(err)
      } else if (!model) {
        res.status(404).send(Model.modelName + ' does not exist.')
      } else {
        req[slug] = model
        next()
      }
    })
  }

  // Load all middleware
  middleware.forEach(function (ware) {
    router.use(ware)
  })

  // Get the base routes
  fn(router, byId)

  // Default get all
  router.get('/', function (req, res) {
    Model.find(function (err, models) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(models)
      }
    })
  })

  // Default create
  router.post('/', function (req, res) {
    Model.create(req.body, function (err, model) {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          res.status(409).send(new Error(
            'Resource exists with that information.'))
        } else {
          res.status(400).send(err)
        }
      } else {
        res.status(201).send(model)
      }
    })
  })

  // Default get one
  router.get('/:id', byId, function (req, res) {
    res.status(200).send(req[slug])
  })

  // Default update
  router.put('/:id', byId, function (req, res) {
    for (var param in req.body) {
      req[slug][param] = req.body[param]
    }

    req[slug].save(function (err, model) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(model)
      }
    })
  })

  // Default delete
  router.delete('/:id', byId, function (req, res) {
    req[slug].remove(function (err) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(204).end()
      }
    })
  })

  return router
}

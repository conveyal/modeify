var auth = require('../auth')
var createRouter = require('../model-router')
var Location = require('./model')

/**
 * Expose `router`
 */

module.exports = createRouter({
  model: Location
}, function (router, byId) {
  /**
   * Create
   */

  router.post('/', auth.isLoggedIn, function (req, res) {
    var coord = req.body.coordinate
    var data = {
      category: req.body.category,
      created_by: req.body.created_by || (req.session.user ? req.session.user._id : null),
      name: req.body.name
    }

    if (req.body.address) data.address = req.body.address
    if (coord && coord.lat && coord.lng) data.coordinate = coord

    Location.create(data, function (err, location) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).send(location)
      }
    })
  })

  router.get('/created_by/:id', auth.isLoggedIn, (req, res) => {
    Location
      .find()
      .where('created_by', req.params.id)
      .exec()
      .then((locations) => {
        res.status(200).send(locations || [])
      }, (err) => {
        res.status(400).send(err)
      })
  })

  /**
   * Update
   */

  router.put('/:id', auth.commuterIsLoggedIn, byId, function (req, res) {
    req.location.category = req.body.category
    req.location.name = req.body.name
    req.location.save(function (err, location) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(location)
      }
    })
  })

})

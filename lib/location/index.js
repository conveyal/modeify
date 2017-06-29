
const {adminRequired, authenticateUser} = require('../auth0')
const CommuterLocation = require('../commuter-locations/model')
const createRouter = require('../model-router')
const Location = require('./model')

/**
 * Expose `router`
 */

module.exports = createRouter({
  model: Location
}, function (router, byId) {
  /**
   * Create
   */

  router.get('/:id', (req, res) => {
    Location
      .findById(req.params.id)
      .exec()
      .then((loc) => {
        CommuterLocation.getCommuterCount(loc._id).then(count => {
          loc.commuter_count = count
          res.status(201).send(loc)
        })
      }, (err) => {
        res.status(400).send(err)
      })
  })

  router.post('/', (req, res) => {
    const coord = req.body.coordinate
    const data = {
      category: req.body.category,
      created_by: req.body.created_by || (req.user ? req.user.id : null),
      name: req.body.name
    }

    if (req.body.address) data.address = req.body.address
    if (coord && coord.lat && coord.lng) data.coordinate = coord

    Location.create(data, (err, location) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).send(location)
      }
    })
  })

  router.get('/created_by/:id', authenticateUser, (req, res) => {
    Location
      .find()
      .where('created_by', req.params.id)
      .exec()
      .then((locations) => {
        Promise.all(locations.map(loc => CommuterLocation.getCommuterCount(loc._id))).then(counts => {
          locations.forEach((loc, k) => {
            loc.commuter_count = counts[k]
          })
          res.status(200).send(locations || [])
        })
      }, (err) => {
        res.status(400).send(err)
      })
  })

  /**
   * Update
   */

  router.put('/:id', authenticateUser, adminRequired, byId, (req, res) => {
    req.location.category = req.body.category
    req.location.name = req.body.name
    req.location.match_radius = req.body.match_radius
    req.location.rideshare_manager = req.body.rideshare_manager
    req.location.save(function (err, location) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(location)
      }
    })
  })

  /**
   * Analysis for this location
   */

  router.get('/:id/analysis', authenticateUser, adminRequired, (req, res) => {
    // run the analysis for this location
    CommuterLocation
      .analyze(req.params.id)
      .then((results) => {
        // or job id?
        res.status(200).send(results)
      }, (err) => {
        res.status(400).send(err)
      })
  })
})

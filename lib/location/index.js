import auth from '../auth'
import CommuterLocation from '../commuter-locations/model'
import createRouter from '../model-router'
import Location from './model'

/**
 * Expose `router`
 */

module.exports = createRouter({
  model: Location
}, function (router, byId) {
  /**
   * Create
   */

  router.post('/', auth.isLoggedIn, (req, res) => {
    const coord = req.body.coordinate
    const data = {
      category: req.body.category,
      created_by: req.body.created_by || (req.session.user ? req.session.user._id : null),
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

  router.put('/:id', auth.isLoggedIn, byId, (req, res) => {
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

  /**
   * Analysis for this location
   */

  router.get('/:id/analysis', auth.isLoggedIn, (req, res) => {
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

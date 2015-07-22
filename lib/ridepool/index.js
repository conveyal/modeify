import auth from '../auth'
import createRouter from '../model-router'
import Ridepool from './model'

import log from '../log'

/**
 * Expose `router`
 */

module.exports = createRouter({
  model: Ridepool
}, function (router, byId) {
  /**
   * Create
   */

  router.post('/', auth.isLoggedIn, (req, res) => {
    /*const coord = req.body.coordinate
    const data = {
      category: req.body.category,
      created_by: req.body.created_by || (req.session.user ? req.session.user._id : null),
      name: req.body.name
    }

    if (req.body.address) data.address = req.body.address
    if (coord && coord.lat && coord.lng) data.coordinate = coord*/

    const data = {
      created_by: req.body.created_by || (req.session.user ? req.session.user._id : null),
      name: req.body.name,
      type: req.body.type,
      visibility: req.body.visibility,
      from_lat: req.body.from_lat,
      from_lng: req.body.from_lng,
      to_lat: req.body.to_lat,
      to_lng: req.body.to_lng,
    }


    Ridepool.create(data, (err, ridepool) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).send(ridepool)
      }
    })
  })

  router.get('/created_by/:id', auth.isLoggedIn, (req, res) => {
    log.info('ridepools/created_by %s', req.params.id)
    Ridepool
      .find()
      .where('created_by', req.params.id)
      .exec()
      .then((ridepools) => {
        res.status(200).send(ridepools || [])
      }, (err) => {
        res.status(400).send(err)
      })
  })

  /**
   * Update
   */

  router.put('/:id', auth.commuterIsLoggedIn, byId, (req, res) => {
    req.ridepool.name = req.body.name
    req.ridepool.type = req.body.type
    req.ridepool.visibility = req.body.visibility
    req.ridepool.from_lat = req.body.from_lat
    req.ridepool.from_lng = req.body.from_lng
    req.ridepool.to_lat = req.body.to_lat
    req.ridepool.to_lng = req.body.to_lng
    req.ridepool.save(function (err, ridepool) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(ridepool)
      }
    })
  })

  /**
   * Delete
   */

  router.delete('/:id', auth.isLoggedIn, byId, (req, res) => {
    req.ridepool
      .remove()
      .then(() => {
        res.status(204).end()
      }, (err) => {
        res.status(400).send(err)
      })
  })
})
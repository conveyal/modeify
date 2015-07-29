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

    const data = {
      created_by: req.body.created_by || (req.session.user ? req.session.user._id : null),
      name: req.body.name,
      type: req.body.type,
      visibility: req.body.visibility,
      from: req.body.from,
      to: req.body.to
    }


    Ridepool.create(data, (err, ridepool) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).send(ridepool)
      }
    })
  })

  /**
   * Batch create
   */

  router.post('/batch', auth.isLoggedIn, function (req, res) {

    var ridepools = req.body.filter((ridepool) => {
      return (ridepool.name && ridepool.from_lat && ridepool.from_lng && ridepool.to_lat && ridepool.to_lng) 
    })

    Promise.all(ridepools.map((ridepool) => {
      return Ridepool.create({
        created_by: ridepool.created_by || (req.session.user ? req.session.user._id : null),
        name: ridepool.name,
        type: ridepool.type || 'vanpool',
        visibility: ridepool.visibility || 'public',
        from_lat: ridepool.from_lat,
        from_lng: ridepool.from_lng,
        to_lat: ridepool.to_lat,
        to_lng: ridepool.to_lng
      })
    })).then((ridepools) => {
        res.status(200).send(ridepools)
      })
      .catch((err) => {
        log.info('batch err: ' + err)
        res.status(400).send(err)
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

  router.put('/:id', auth.isLoggedIn, byId, (req, res) => {
    req.ridepool.name = req.body.name
    req.ridepool.type = req.body.type
    req.ridepool.visibility = req.body.visibility
    req.ridepool.from = req.body.from
    req.ridepool.to = req.body.to
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
import stormpath from 'express-stormpath'

import log from '../log'
import createRouter from '../model-router'
import ServiceAlert from './model'

/**
 * Expose `router`
 */

module.exports = createRouter({
  middleware: [stormpath.authenticationRequired],
  model: ServiceAlert
}, function (router, byId) {

  /**
   * Create
   */

  router.post('/', (req, res) => {
    const data = {
      //created_by: req.body.created_by || (req.user ? req.user.id : null),
      text: req.body.text,
      url: req.body.url,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate
    }

    ServiceAlert.create(data, (err, ridepool) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).send(ridepool)
      }
    })
  })

  router.delete('/:id', byId, (req, res) => {
    console.log('>> del alert', req);
    req.servicealert
      .remove()
      .then(() => {
        res.status(204).end()
      }, (err) => {
        res.status(400).send(err)
      })
  })
})

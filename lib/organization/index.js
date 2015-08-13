import stormpath from 'express-stormpath'

import createRouter from '../model-router'
import Org from './model'

/**
 * Expose `router`
 */

module.exports = createRouter({
  middleware: [stormpath.authenticationRequired],
  model: Org
}, function (router, byId) {
  /**
   * Update an org
   */

  router.put('/:id', byId, function (req, res) {
    req.organization.name = req.body.name
    req.organization.address = req.body.address
    req.organization.city = req.body.city
    req.organization.state = req.body.state
    req.organization.zip = req.body.zip
    req.organization.labels = req.body.labels
    req.organization.opts = req.body.opts
    req.organization.contact = req.body.contact
    req.organization.email = req.body.email
    req.organization.coordinate = req.body.coordinate
    req.organization.save(function (err) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(204).end()
      }
    })
  })
})

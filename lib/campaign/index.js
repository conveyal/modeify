var createRouter = require('../model-router')
var Campaign = require('./model')
var stormpath = require('express-stormpath')

/**
 * Expose `app`
 */

module.exports = createRouter({
  middleware: [stormpath.authenticationRequired],
  model: Campaign
}, function (router, byId) {
  /**
   * Update a campaign
   */

  router.put('/:id', byId, function (req, res) {
    req.campaign.filters = req.body.filters
    req.campaign.status = req.body.status
    req.campaign.save(function (err) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(204).end()
      }
    })
  })

  /**
   * Send
   */

  router.get('/:id/send', byId, function (req, res) {
    req.campaign.send(function (err) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(204).end()
      }
    })
  })

})

var auth = require('../auth');
var createRouter = require('../model-router');
var Campaign = require('./model');

/**
 * Expose `app`
 */

module.exports = createRouter({
  middleware: [auth.isLoggedIn],
  model: Campaign
}, function(router, byId) {

  /**
   * Update a campaign
   */

  router.put('/:id', byId, function(req, res) {
    req.campaign.filters = req.body.filters;
    req.campaign.status = req.body.status;
    req.campaign.save(function(err) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(204);
      }
    });
  });

  /**
   * Send
   */

  router.get('/:id/send', byId, function(req, res) {
    req.campaign.send(function(err) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(204);
      }
    });
  });

});

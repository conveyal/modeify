var auth = require('../auth');
var createRouter = require('../model-router');
var Org = require('./model');

/**
 * Expose `router`
 */

module.exports = createRouter({
  middleware: [auth.isLoggedIn],
  model: Org
}, function(router, byId) {

  /**
   * Update an org
   */

  router.put('/:id', byId, function(req, res) {
    req.organization.name = req.body.name;
    req.organization.address = req.body.address;
    req.organization.city = req.body.city;
    req.organization.state = req.body.state;
    req.organization.zip = req.body.zip;
    req.organization.labels = req.body.labels;
    req.organization.opts = req.body.opts;
    req.organization.contact = req.body.contact;
    req.organization.email = req.body.email;
    req.organization.coordinate = req.body.coordinate;
    req.organization.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(204).end();
      }
    });
  });

});

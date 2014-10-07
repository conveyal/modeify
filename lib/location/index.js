var auth = require('../auth');
var createRouter = require('../model-router');
var Location = require('./model');

/**
 * Expose `router`
 */

module.exports = createRouter({
  model: Location
}, function(router, byId) {

  /**
   * Create
   */

  router.post('/', auth.commuterIsLoggedIn, function(req, res) {
    var created_by = req.session && req.session.user ? req.session.user._id :
      null;

    Location.create({
      address: req.body.address,
      category: req.body.category,
      created_by: created_by,
      name: req.body.name
    }, function(err, location) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(201).send(location);
      }
    });
  });

  /**
   * Update
   */

  router.put('/:id', auth.commuterIsLoggedIn, byId, function(req, res) {
    req.location.category = req.body.category;
    req.location.name = req.body.name;
    req.location.save(function(err, location) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(location);
      }
    });
  });

});

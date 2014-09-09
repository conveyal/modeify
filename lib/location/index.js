var auth = require('../auth'); // TODO: Auth all requests
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

  router.post('/', function(req, res) {
    var created_by = req.session && req.session.user ? req.session.user._id :
      null;

    Location.create({
      address: req.body.address,
      category: req.body.category,
      created_by: created_by,
      name: req.body.name
    }, function(err, location) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(201, location);
      }
    });
  });

  /**
   * Update
   */

  router.put('/:id', byId, function(req, res) {
    req.location.category = req.body.category;
    req.location.name = req.body.name;
    req.location.save(function(err, location) {
      if (err) {
        res.send(400, err);
      } else {
        res.send(200, location);
      }
    });
  });

});

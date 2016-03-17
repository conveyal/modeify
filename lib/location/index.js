var auth = require('../auth');
var createRouter = require('../model-router');
var Location = require('./model');
var geocoderBing = require('../binggeocode');
var geocoderNominatim = require('../nominatimgeocode');

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

    var coord = req.body.coordinate;
    var magic_key = req.body.magic_key;
    var data = {
      category: req.body.category,
      created_by: created_by,
      name: req.body.name
    };

    if (req.body.address) data.address = req.body.address;
    if (coord && coord.lat && coord.lng) data.coordinate = coord;

    Location.create(data, function(err, location) {
      if (err) {
        res.status(400).send(err);
      } else {
        if(location && location.coordinate) {
          if(location.coordinate.lat === 0 && location.coordinate.lng === 0) {
             // If lat/lng == 0, try Nominatim geocoder 
             queryNominatim(data.address, res);
          } else {
            res.status(201).send(location);
          }
        }
      }
    });
  });

  function queryNominatim(address, res) {
    geocoderNominatim.suggest(address, function(err, location) {
       if (err) {
             res.status(400).send(err);
       } else {
          if(location.length > 0) {
            var loc = location[0];
            var newLoc = {
              __v: 0,
              address: loc.display_name,
              coordinate: { 
                lat: loc.lat,
                lng: loc.lon
              }
            };
            res.status(201).send(newLoc);
          } else {
            res.status(400).send(err);
          }
      }
    });   
  } 
 
  function queryBing(address, res) {
     geocoderBing.encode(address, function(err, location) {
        if (err) {
            res.status(400).send(err);
        } else {
            if(location.length > 0) {
              var loc = location[0];
              var newLoc = {
                 __v: 0,
                 address: loc.address,
                 coordinate: loc.coordinate
               };
               res.status(201).send(newLoc);
            } else {
               res.status(400).send(err);
            }
           }
      });
  }

  /**
   * Update
   */

  router.put('/:id', auth.commuterIsLoggedIn, byId, function(req, res) {
    req.location.category = req.body.category;
    req.location.name = req.body.name;
    req.location.save(function(err, location) {

    console.log("location lib/location->", location);

      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(location);
      }
    });
  });

});

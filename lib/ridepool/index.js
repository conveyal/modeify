import stormpath from 'express-stormpath'

import Location from '../location/model'
import log from '../log'
import createRouter from '../model-router'
import Ridepool from './model'

/**
 * Expose `router`
 */

module.exports = createRouter({
  middleware: [stormpath.authenticationRequired],
  model: Ridepool
}, function (router, byId) {
  /**
   * Create
   */

  router.post('/', (req, res) => {
    const data = {
      created_by: req.body.created_by || (req.user ? req.user.id : null),
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

  router.post('/batch', function (req, res) {
    var ridepools = req.body.filter((ridepool) => {
      return (ridepool.name && ridepool.from_lat && ridepool.from_lng && ridepool.to_lat && ridepool.to_lng)
    })

    // create map of unique Location data objects for this set of Ridepools to be created
    var uniqueLocations = {}

    var addLocationData = function (lng, lat, created_by) {
      uniqueLocations[lng + ',' + lat] = {
        coordinate: {
          lng: parseFloat(lng),
          lat: parseFloat(lat)
        },
        created_by: created_by
      }
    }

    ridepools.forEach((ridepool) => {
      addLocationData(ridepool.from_lng, ridepool.from_lat, ridepool.created_by)
      addLocationData(ridepool.to_lng, ridepool.to_lat, ridepool.created_by)
    })

    // helper function to create Promise that finds or creates Location
    var getLocationPromise = function (locationData) {
      return new Promise((resolve, reject) => {
        Location.findOrCreate(locationData, function (err, loc) {
          if (err) reject(err)
          resolve(loc)
        })
      })
    }

    // retrieve/create all of the Locations
    Promise.all(Object.keys(uniqueLocations).map((key) => {
      return getLocationPromise(uniqueLocations[key])
    })).then((locations) => { // all locations founds/created
      // create lookup for Locations by lng/lat coord
      var locationsByLngLat = {}
      locations.forEach((location) => {
        locationsByLngLat[location.coordinate.lng + ',' + location.coordinate.lat] = location
      })

      // create the Ridepools
      Promise.all(ridepools.map((ridepool) => {
        return Ridepool.create({
          created_by: ridepool.created_by || (req.user ? req.user.id : null),
          name: ridepool.name,
          type: ridepool.type || 'vanpool',
          visibility: ridepool.visibility || 'public',
          from: locationsByLngLat[ridepool.from_lng + ',' + ridepool.from_lat]._id,
          to: locationsByLngLat[ridepool.to_lng + ',' + ridepool.to_lat]._id
        })
      })).then((ridepools) => { // all Ridepools created
        res.status(200).send(ridepools)
      })
    }).catch((err) => {
      log.info('batch err: ' + err)
      res.status(400).send(err)
    })
  })

  /**
   * Retrieve by creating entity
   */

  router.get('/created_by/:id', (req, res) => {
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
   * Retrieve by location (from or to)
   */

  router.get('/by-location/:id', (req, res) => {
    Ridepool
      .find()
      .or([
        {from: req.params.id},
        {to: req.params.id}
      ])
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

  router.put('/:id', byId, (req, res) => {
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

  router.delete('/:id', byId, (req, res) => {
    req.ridepool
      .remove()
      .then(() => {
        res.status(204).end()
      }, (err) => {
        res.status(400).send(err)
      })
  })
})

const express = require('express')

const {authenticationRequired} = require('../auth0')
const log = require('../log')
const Location = require('../location/model')
const CommuterLocations = require('./model')

const router = express.Router()

module.exports = router

router.get('/', authenticationRequired, function (req, res) {
  const query = req.query

  if (query._location) {
    CommuterLocations
      .findCommutersAndProfiles(query._location, query.offset, query.limit)
      .then((results) => {
        res.status(200).send(results.filter(cl => {
          return cl._commuter && cl._commuter._id
        }))
      })
      .catch((err) => {
        log.error(err)
        res.status(400).send(err)
      })
  } else if (query._commuter) {
    CommuterLocations
      .findLocationsForCommuter(query._commuter)
      .then((results) => {
        res.status(200).send(results)
      }, (err) => {
        res.status(400).send(err)
      })
  } else {
    res.status(404).send('Must pass a commuter or location')
  }
})

router.get('/coordinates', authenticationRequired, function (req, res) {
  const query = req.query

  if (query._location) {
    CommuterLocations
      .find()
      .where('_location', query._location)
      .populate('_commuter')
      .exec()
      .then((results) => {
        const coords = results.map((cl) => {
          return {
            lat: cl._commuter.coordinate.lat,
            lng: cl._commuter.coordinate.lng,
            _id: cl._id
          }
        })
        res.status(200).send(coords)
      }, (err) => {
        res.status(400).send(err)
      })
  } else {
    res.status(404).send('Must pass a location')
  }
})

router.post('/', authenticationRequired, function (req, res) {
  CommuterLocations
    .addCommuters(req.body)
    .then((status) => {
      res.status(200).send(status)
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

router.get('/profile-and-match', authenticationRequired, function (req, res) {
  CommuterLocations
    .findCommutersAndProfiles(req.query._location)
    .then((cls) => {
      return CommuterLocations.profileAndMatch(cls, () => {
        CommuterLocations.notifyManagers(req.query._location)
      })
    })
    .then((status) => {
      res.status(200).send(status)
    }, (err) => {
      res.status(400).send(err)
    })
})

router.get('/profile', authenticationRequired, function (req, res) {
  CommuterLocations
    .findCommutersAndProfiles(req.query._location)
    .then((cls) => {
      return CommuterLocations.profile(cls, () => {
        CommuterLocations.notifyManagers(req.query._location)
      })
    })
    .then((status) => {
      res.status(200).send(status)
    }, (err) => {
      res.status(400).send(err)
    })
})

router.get('/match', authenticationRequired, function (req, res) {
  Location
    .findById(req.query._location)
    .exec()
    .then((loc) => {
      CommuterLocations
        .findCommutersAndProfiles(req.query._location)
        .then((cls) => {
          return CommuterLocations.match(cls, loc.match_radius, () => {
            CommuterLocations.notifyManagers(req.query._location)
            res.status(200).send('completed')
          })
        })
        .catch((err) => {
          res.status(400).send(err)
        })
    }, (err) => {
      res.status(400).send(err)
    })
})

router.get('/send-profiles-and-matches', authenticationRequired, function (req, res) {
  CommuterLocations
    .findCommutersAndProfiles(req.query._location)
    .then((cls) => {
      return CommuterLocations.sendProfilesAndMatches(cls)
    })
    .then((status) => {
      res.status(200).send(status)
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

router.get('/:id/send-profile-and-matches', authenticationRequired, findById, function (req, res) {
  req.commuterLocation.sendProfileAndMatches(req.stormpathClient)
    .then((status) => {
      res.status(200).end()
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

router.delete('/:id', authenticationRequired, findById, function (req, res) {
  req.commuterLocation
    .remove()
    .then(() => {
      res.status(204).end()
    }, (err) => {
      res.status(400).send(err)
    })
})

function findById (req, res, next) {
  CommuterLocations
    .findByIdAndPopulate(req.params.id)
    .then((cl) => {
      if (!cl) {
        res.status(401).send('Commuter Location does not exist.')
      } else {
        req.commuterLocation = cl
        next()
      }
    })
    .catch((err) => {
      res.status(400).send(err)
    })
}

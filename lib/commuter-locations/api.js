import express from 'express'
import stormpath from 'express-stormpath'

import log from '../log'
import CommuterLocations from './model'

const router = express.Router()

export default router

router.get('/', stormpath.authenticationRequired, function (req, res) {
  const query = req.query

  if (query._location) {
    CommuterLocations
      .findCommutersAndProfiles(query._location)
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

router.post('/', stormpath.authenticationRequired, function (req, res) {
  CommuterLocations
    .addCommuters(req.stormpathApplication, req.body)
    .then((commuters) => {
      res.status(200).send(commuters)
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

router.get('/profile-and-match', stormpath.authenticationRequired, function (req, res) {
  CommuterLocations
    .findCommutersAndProfiles(req.query._location)
    .then((cls) => {
      return CommuterLocations.profileAndMatch(cls)
    })
    .then((status) => {
      res.status(200).send(status)
    }, (err) => {
      res.status(400).send(err)
    })
})

router.get('/send-profiles-and-matches', stormpath.authenticationRequired, function (req, res) {
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

router.get('/:id/send-profile-and-matches', stormpath.authenticationRequired, findById, function (req, res) {
  req.commuterLocation.sendProfileAndMatches(req.stormpathClient)
    .then((status) => {
      res.status(200).end()
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

router.delete('/:id', stormpath.authenticationRequired, findById, function (req, res) {
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

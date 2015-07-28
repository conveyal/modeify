import auth from '../auth'
import CommuterLocations from './model'
import express from 'express'

const router = express.Router()

export default router

router.get('/', auth.isLoggedIn, function (req, res) {
  const query = req.query

  if (query._location) {
    CommuterLocations
      .findCommutersAndProfiles(query._location)
      .then((results) => {
        res.status(200).send(results)
      })
      .catch((err) => {
        res.status(400).send(err)
      })
  } else if (query._commuter) {
    // TODO: Find locations for a commuter
  }
})

router.post('/', auth.isLoggedIn, function (req, res) {
  CommuterLocations
    .addCommuters(req.body)
    .then((commuters) => {
      res.status(200).send(commuters)
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

router.get('/profile-and-match', auth.isLoggedIn, function (req, res) {
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

router.get('/send-profiles-and-matches', auth.isLoggedIn, function (req, res) {
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

router.delete('/:id', auth.isLoggedIn, findById, function (req, res) {
  req.commuterLocation
    .remove()
    .then(() => {
      res.status(204).end()
    }, (err) => {
      res.status(400).send(err)
    })
})

function findById (req, res, next) {
  CommuterLocations.findById(req.params.id, (err, cl) => {
    if (err) {
      res.status(400).send(err)
    } else if (!cl) {
      res.status(401).send('Commuter Location does not exist.')
    } else {
      req.commuterLocation = cl
      next()
    }
  })
}

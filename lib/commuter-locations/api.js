import auth from '../auth'
import CommuterLocations from './model'
import express from 'express'

const router = express.Router()

export default router

router.get('/', auth.isLoggedIn, (req, res) => {
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

router.post('/', auth.isLoggedIn, (req, res) => {
  CommuterLocations
    .addCommuters(req.body)
    .then((commuters) => {
      res.status(200).send(commuters)
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

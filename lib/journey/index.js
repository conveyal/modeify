const express = require('express')

const {authenticateUser} = require('../auth0')
const Journey = require('./model')

const router = express.Router()

module.exports = router

router.get('/', authenticateUser, function (req, res) {
  Journey
    .find({
      created_by: req.user.id,
      trashed: undefined
    })
    .populate('locations')
    .exec((err, journeys) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(journeys)
      }
    })
})

router.post('/', authenticateUser, function (req, res) {
  const data = req.body
  data.created_by = req.user.id

  Journey.generate(req.body, (err, journey) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(201).send(journey)
    }
  })
})

/**
 * Get a Journey
 */

router.get('/:id', authenticateUser, findById, function (req, res) {
  res.status(200).send(req.journey)
})

/**
 * Remove
 */

router.delete('/:id', authenticateUser, findById, function (req, res) {
  req.journey.trash((err) => {
    if (err) {
      res.status(400).send('Failed to remove journey.')
    } else {
      res.status(204).end()
    }
  })
})

/**
 * Find by id
 */

function findById (req, res, next) {
  Journey.findById(req.params.id, (err, journey) => {
    if (err) {
      res.status(400).send(err)
    } else if (!journey || journey.trashed !== undefined) {
      res.status(404).send('Journey does not exist.')
    } else {
      req.journey = journey
      next()
    }
  })
}

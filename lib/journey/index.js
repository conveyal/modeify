var auth = require('../auth')
var express = require('express')
var Journey = require('./model')

/**
 * Expose `router`
 */

var router = module.exports = express.Router()

/**
 * Get all of a commuters journeys
 */

router.get('/', auth.commuterIsLoggedIn, function (req, res) {
  Journey
    .find({
      created_by: req.session.commuter._id,
      trashed: undefined
    })
    .populate('locations')
    .exec(function (err, journeys) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(journeys)
      }
    })
})

/**
 * Create a Journey
 */

router.post('/', auth.commuterIsLoggedIn, function (req, res) {
  var data = req.body
  data.created_by = req.session.commuter._id

  Journey.generate(req.body, function (err, journey) {
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

router.get('/:id', auth.commuterIsLoggedIn, findById, function (req, res) {
  res.status(200).send(req.journey)
})

/**
 * Remove
 */

router.delete('/:id', auth.commuterIsLoggedIn, findById, function (req, res) {
  req.journey.trash(function (err) {
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
  Journey.findById(req.params.id, function (err, journey) {
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

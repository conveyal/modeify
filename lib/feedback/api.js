const {Router} = require('express')
const stormpath = require('express-stormpath')

const Feedback = require('./model')
const {group} = require('../stormpath')

const router = Router()

/**
 * Expose `router`
 */

module.exports = router

/**
 * Get all of the feedback
 */

router.get('/', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), function (req, res) {
  Feedback
    .find({
      trashed: undefined
    })
    .populate('_commuter')
    .exec((err, feedback) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(feedback)
      }
    })
})

/**
 * Create feedback
 */

router.post('/', function (req, res) {
  const data = req.body

  if (req.user) {
    data.account = req.user.id
  }

  Feedback.create(data, (err, feedback) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send(feedback)
    }
  })
})

/**
 * Update feedback
 */

router.delete('/:id', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), function (req, res) {
  try {
    Feedback
      .findById(req.params.id)
      .exec()
      .then((feedback) => {
        return feedback.trash()
      })
      .then(() => {
        res.status(204).end()
      })
  } catch (e) {
    res.status(400).send(e)
  }
})

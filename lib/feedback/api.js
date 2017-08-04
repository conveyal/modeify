const {Router} = require('express')

const {adminRequired, authenticationOptional, authenticateUser} = require('../auth0')
const Feedback = require('./model')

const router = Router()

/**
 * Expose `router`
 */

module.exports = router

/**
 * Get all of the feedback
 */

router.get('/', authenticateUser, adminRequired, function (req, res) {
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

router.post('/', authenticateUser, authenticationOptional, function (req, res) {
  const data = req.body

  if (req.user) {
    data.account = req.user.email
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

router.delete('/:id', authenticateUser, adminRequired, function (req, res) {
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

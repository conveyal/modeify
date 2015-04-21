import {Router} from 'express'

import auth from '../auth'
import Feedback from './model'

const router = Router()

/**
 * Expose `router`
 */

export default router

/**
 * Get all of the feedback
 */

router.get('/', auth.isLoggedIn, auth.isManager, function (req, res) {
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

router.post('/', auth.commuterIsLoggedIn, function (req, res) {
  const data = req.body
  data._commuter = req.session.commuter._id

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

router.delete('/:id', auth.isLoggedIn, auth.isManager, function (req, res) {
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

import {Router} from 'express'
import stormpath from 'express-stormpath'

import Feedback from './model'

const router = Router()

/**
 * Expose `router`
 */

export default router

/**
 * Get all of the feedback
 */

router.get('/', stormpath.authenticationRequired, stormpath.groupsRequired(['admin']), function (req, res) {
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
    data._user = req.user.id
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

router.delete('/:id', stormpath.authenticationRequired, stormpath.groupsRequired(['admin']), function (req, res) {
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

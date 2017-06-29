const express = require('express')

const {adminRequired, authenticateUser} = require('../auth0')
const ServiceAlert = require('./model')

const app = module.exports = express.Router()

/**
 * Get all alerts
 */
app.get('/', function (req, res) {
  ServiceAlert
    .find()
    .exec()
    .then(alerts => {
      res.status(200).send(alerts)
    })
    .catch(err => {
      res.status(400).send(err)
    })
})

app.post('/', authenticateUser, adminRequired, (req, res) => {
  const data = {
    // created_by: req.body.created_by || (req.user ? req.user.id : null),
    text: req.body.text,
    url: req.body.url,
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    alertUrl: req.body.alertUrl
  }

  ServiceAlert.create(data, (err, servicealert) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(201).send(servicealert)
    }
  })
})

/**
 * Middleware to retrieve a commuter by id
 */

function get (req, res, next) {
  ServiceAlert
    .findById(req.params.id)
    .exec()
    .then(servicealert => {
      if (!servicealert) {
        return res.status(404).send('ServiceAlert does not exist.')
      }
      req.servicealert = servicealert
      next()
    })
    .catch(err => {
      res.status(400).send(err)
    })
}

app.delete('/:id', authenticateUser, adminRequired, get, (req, res) => {
  console.log('>>> del alert')
  req.servicealert
    .remove()
    .then(() => {
      res.status(204).end()
    }, (err) => {
      res.status(400).send(err)
    })
})

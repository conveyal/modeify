const express = require('express')

const {profile} = require('./')

const app = module.exports = express.Router()

app.all('*', function (req, res) {
  profile(req.url.split('?')[1])
    .then((data) => {
      if (req.query.callback) { // JSONP requests
        res.type('text/javascript')
        res.status(200).send(data)
      } else {
        res.type('application/json')
        res.status(200).send(data)
      }
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

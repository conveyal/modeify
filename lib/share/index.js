const {Router} = require('express')
const config = require('../config')
const spark = require('../spark')
const log = require('../log')

const app = module.exports = Router()

app.post('/share-trip', function (req, res) {
  // send email
  const options = {
    application: config.application,
    subject: req.body.subject,
    body: req.body.body,
    trip_url: req.body.link,
    template: 'share-trip',
    from_email: req.body.from,
    from_name: req.body.from,
    to: {
      email: req.body.to
    }
  }
  spark.send(options, (err, result) => {
    if (err) {
      log.error(err)
      res.status(400).send(err)
    } else {
      console.log('sent!')
      res.status(200).send()
    }
  })
})

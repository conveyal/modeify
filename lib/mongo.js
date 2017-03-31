const mongoose = module.exports = require('mongoose')

const config = require('./config')
const log = require('./log')

const url = config.mongodb_url || `mongodb://localhost:27017/modeify-${process.env.NODE_ENV}`

connect()

mongoose.Promise = Promise

function connect () {
  mongoose.connect(url, {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    },
    replset: {
      socketOptions: {
        keepAlive: 1
      }
    }
  })

  mongoose.connection.on('error', err => {
    log.error('Error connecting to MongoDB. Check your MongoDB instance and `MONGODB_URL` environment variable.')
    log.error(err.name, err.message, err.stack)
  })
}

var log = require('./log')
var mongoose = require('mongoose')

var url = process.env.MONGODB_URL || 'mongodb://localhost:27017/modeify-' + process.env.NODE_ENV

connect()

module.exports = mongoose

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

  mongoose.connection.on('error', function (err) {
    log.error('Error connecting to MongoDB. Check your MongoDB instance and `MONGODB_URL` environment variable.')
    log.error(err.name, err.message, err.stack)
  })
}

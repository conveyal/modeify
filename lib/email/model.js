const mongoose = require('../mongo')
const mongooseTrackable = require('../plugins/mongoose-trackable')
const spark = require('../spark')

const schema = new mongoose.Schema({
  account: String,
  _commuter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commuter'
  },
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  outdated: Boolean,
  metadata: mongoose.Schema.Types.Mixed,
  result: mongoose.Schema.Types.Mixed,
  events: Array
})

schema.plugin(mongooseTrackable)

schema.methods.syncWithSpark = function (callback) {
  const email = this
  if (email.outdated) return callback()

  spark.info(email.result._id, (err, data) => {
    if (err) {
      // Email does not exist in spark anymore
      if (err.code === 11) {
        email.outdated = true
        email.save(callback)
      } else {
        callback(err)
      }
    } else {
      email.result = data
      email.save(callback)
    }
  })
}

schema.methods.updateCommuter = function (commuter, callback) {
  if (arguments.length === 1) {
    callback = commuter
    commuter = this._commuter
  }

  // if commuter doesn't exist, just return
  if (!commuter) return callback()

  // latest event
  const event = this.latestEvent()

  // Default status
  commuter.status = 'sent'

  // has clicks or was a click event
  if (this.result.clicks > 0 || event.event === 'click') {
    commuter.status = 'clicked'
  } else if (this.result.opens > 0 || event.event === 'open') {
    commuter.status = 'opened'
  } else if (event.event === 'bounced') {
    commuter.status = 'bounced'
  }

  commuter.save(callback)
}

schema.methods.latestEvent = function () {
  return (this.events || []).slice(-1)[0] || {}
}

const Email = mongoose.model('Email', schema)

module.exports = Email

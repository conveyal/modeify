const mongoose = require('../mongo')
const trackable = require('../plugins/mongoose-trackable')
const trash = require('../plugins/mongoose-trash')

const Schema = mongoose.Schema

const schema = new Schema({
  account: String,
  feedback: String,
  plan: Schema.Types.Mixed,
  results: Schema.Types.Mixed
})

schema.plugin(trackable)
schema.plugin(trash)

const Feedback = mongoose.model('Feedback', schema)

module.exports = Feedback

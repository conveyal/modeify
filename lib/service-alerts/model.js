const mongoose = require('../mongo')

const schema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  alertUrl: {
    type: String
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  }
})

const ServiceAlert = mongoose.model('ServiceAlert', schema)

module.exports = ServiceAlert

import mongoose from '../mongo'

const schema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  alert_url: {
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

export default ServiceAlert

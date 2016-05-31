const {findRidepoolMatches} = require('ridematcher')

const mongoose = require('../mongo')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  visibility: {
    type: String,
    default: 'public'
  },
  type: {
    type: String,
    default: 'vanpool'
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }
})

schema.statics.findMatches = function (start, end) {
  return Ridepool
    .find()
    .populate('from to created_by')
    .exec()
    .then((ridepools) => {
      return findRidepoolMatches(start, end, formatRidepools(filterInvalidRidepools(ridepools)))
    })
}

function filterInvalidRidepools (ridepools) {
  // filter ridepools by visibility & valid from/to locations
  return ridepools.filter((ridepool) => {
    return ridepool.from && ridepool.to && ridepool.created_by && ridepool.visibility === 'public'
  // TODO: check for internally visible ridepools
  })
}

function formatRidepools (ridepools) {
  // convert ridepool list to format expected by ridematcher.js
  return ridepools.map((ridepool) => {
    return {
      _id: ridepool._id,
      name: ridepool.name,
      organization: {
        id: ridepool.created_by._id,
        name: ridepool.created_by.name,
        url: ridepool.created_by.main_url
      },
      from: [ridepool.from.coordinate.lng, ridepool.from.coordinate.lat],
      to: [ridepool.to.coordinate.lng, ridepool.to.coordinate.lat]
    }
  })
}

const Ridepool = mongoose.model('Ridepool', schema)

module.exports = Ridepool

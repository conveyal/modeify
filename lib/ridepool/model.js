import {findRidepoolMatches} from 'ridematcher'

import mongoose from '../mongo'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  created_by: mongoose.Schema.Types.ObjectId,
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

schema.statics.findRidepoolMatches = function (start, end) {
  return Ridepool
    .find()
    .populate('from to')
    .exec()
    .then((ridepools) => {
      return findRidepoolMatches(start, end, formatRidepools(filterInvalidRidepools(ridepools)))
    })
}

function filterInvalidRidepools (ridepools) {
  // filter ridepools by visibility & valid from/to locations
  return ridepools.filter((ridepool) => {
    return ridepool.from && ridepool.to && ridepool.visibility === 'public'
    // TODO: check for internally visible ridepools
  })
}

function formatRidepools (ridepools) {
  // convert ridepool list to format expected by ridematcher.js
  return ridepools.map((ridepool) => {
    return {
      _id: ridepool._id,
      name: ridepool.name,
      from: [ridepool.from.coordinate.lng, ridepool.from.coordinate.lat],
      to: [ridepool.to.coordinate.lng, ridepool.to.coordinate.lat]
    }
  })
}

const Ridepool = mongoose.model('Ridepool', schema)

export default Ridepool

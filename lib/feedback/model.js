import mongoose from '../mongo'
import trackable from '../plugins/mongoose-trackable'
import trash from '../plugins/mongoose-trash'

const Schema = mongoose.Schema

const schema = new Schema({
  _commuter: {
    type: Schema.Types.ObjectId,
    ref: 'Commuter'
  },
  feedback: String,
  plan: Schema.Types.Mixed,
  results: Schema.Types.Mixed
})

schema.plugin(trackable)
schema.plugin(trash)

const Feedback = mongoose.model('Feedback', schema)

export default Feedback

/**
 * Dependencies
 */

var mongoose = require('mongoose');

/**
 * Create `schema`
 */

var schema = new mongoose.Schema({
  _organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'sending', 'completed']
  },
  completed: Date,
  filters: Array
});

/**
 * Set completed
 */

schema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed')
    this.completed = new Date();
  next();
});

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'));

/**
 * Expose `Campaign`
 */

var Campaign = module.exports = mongoose.model('Campaign', schema);

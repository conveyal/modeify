const bcrypt = require('bcryptjs')
const uuid = require('node-uuid').v4

const analytics = require('../analytics')
const mongoose = require('../mongo')

/**
 * Create `schema`
 */

const schema = new mongoose.Schema({
  change_password_key: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  email_confirmation_key: String,
  email_confirmed: {
    type: Boolean,
    default: false
  },
  password: String,
  type: String
})

/**
 * Encrypt the password every time it is modified
 */

schema.pre('save', true, function (next, done) {
  next()
  if (this.isNew && !this.password) {
    this.password = genkey()
  }

  if (this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) {
        done(err)
      } else {
        this.password = hash
        done()
      }
    })
  } else {
    done()
  }
})

/**
 * Send email confirmation on email change
 */

schema.pre('save', function (next) {
  next()
  if (this.isModified('email')) this.email_confirmation_key = genkey()
})

/**
 * Change password
 */

schema.statics.changePassword = function (key, password, callback) {
  const invalidKeyText = 'Invalid change password key. Submit a change password request and use the generated link sent in the email.'
  if (!key || key.length === 0) return callback(invalidKeyText)

  this.findOne({
    change_password_key: key
  }, function (err, user) {
    if (err) {
      callback(err)
    } else if (!user) {
      callback(invalidKeyText)
    } else {
      user.change_password_key = genkey()
      user.email_confirmed = true
      user.password = password
      user.save(callback)
    }
  })
}

/**
 * Confirm Email
 */

schema.statics.confirmEmail = function (key, callback) {
  const invalidKeyText = 'Invalid email confirmation key.'
  if (!key || key.length === 0) {
    return callback(invalidKeyText)
  }

  this.findOne({
    email_confirmation_key: key
  }, function (err, user) {
    if (err) {
      callback(err)
    } else if (!user) {
      callback(invalidKeyText)
    } else {
      analytics.track({
        userId: user._id,
        event: 'Confirmed Email'
      })

      user.email_confirmed = true
      user.save(callback)
    }
  })
}

/**
 * Compare
 */

schema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, callback)
}

/**
 * Find or create
 *
 * @param {String} email
 * @param {Function} callback
 */

schema.statics.findOrCreate = function (data, callback) {
  const email = (data.email || '').toLowerCase()
  if (!email || email.length < 5) return callback(new Error('Invalid email.'))

  this.findOne({
    email: email
  }, (err, user) => {
    if (err) {
      callback(err, user, false)
    } else if (user) {
      callback(null, user, true)
    } else {
      this.create({
        email: email,
        password: data.password,
        type: data.type
      }, (err, user) => {
        callback(err, user, false)
      })
    }
  })
}

/**
 * Plugins
 */

schema.plugin(require('../plugins/mongoose-trackable'))
schema.plugin(require('../plugins/mongoose-querystring'))

/**
 * Create `User`
 */

module.exports = mongoose.model('User', schema)

/**
 * Genkey
 */

function genkey () {
  return uuid().replace(/-/g, '')
}

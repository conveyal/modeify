const jwt = require('express-jwt')

require('./config')

const jwtMiddleWare = jwt({secret: process.env.AUTH0_SECRET})

module.exports.adminRequired = function adminRequired (req, res, next) {
  // TODO: Implement
  res.status(500).send('UNIMPLEMENTED')
}

module.exports.authenticationRequired = jwtMiddleWare

module.exports.createAccount = function createAccount (options) {
  if (!options.password) options.password = 'password'
  if (!options.givenName) options.givenName = 'None'
  if (!options.surname) options.surname = 'none'

  return new Promise((resolve, reject) => {
    // TODO: Implement
    reject(new Error('UNIMPLEMENTED'))

    // stormpath.createAccount(options, (err, createdAccount) => {
    //   if (err) {
    //     reject(err)
    //   } else {
    //     resolve(createdAccount)
    //   }
    // })
  })
}

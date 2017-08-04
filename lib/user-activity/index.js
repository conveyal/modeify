const {Router} = require('express')
const moment = require('moment')

const {adminRequired, authenticateUser, getAccounts} = require('../auth0')

const router = module.exports = Router()

/**
 * Get all of the feedback
 */

router.get('/signups', authenticateUser, adminRequired, function (req, res) {
  var fromDate = moment(req.query.fromDate, 'MM-DD-YYYY')
  var toDate = moment(req.query.toDate, 'MM-DD-YYYY').add(1, 'days')

  if (toDate.isBefore(fromDate)) res.status(200).send([])

  getAccountsPromise({
    include_totals: true,
    q: `user_metadata.createdAtUnix:[${fromDate.unix()} TO ${toDate.unix()}]`
  })
    .then(accounts => {
      res.status(200).send(accounts)
    })
    .catch((err) => {
      console.error(err)
      res.status(501).send(err)
    })
})

function getAccountsPromise (params) {
  return new Promise((resolve, reject) => {
    getAccounts(params, (err, accounts) => {
      if (err) {
        reject(err)
      } else {
        resolve(accounts)
      }
    })
  })
}

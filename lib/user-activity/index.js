const {Router} = require('express')
const stormpath = require('express-stormpath')
const moment = require('moment')
const {group} = require('../stormpath')

const router = Router()

/**
 * Expose `router`
 */

export default router

/**
 * Get all of the feedback
 */

router.get('/signups', stormpath.authenticationRequired, stormpath.groupsRequired([group.administrator()]), function (req, res) {
  var fromDate = moment(req.query.fromDate, 'MM-DD-YYYY')
  var toDate = moment(req.query.toDate, 'MM-DD-YYYY').add(1, 'days')

  if (toDate.isBefore(fromDate)) res.status(200).send([])

  var createdAt = '[' + fromDate.format('YYYY-MM-DD') + 'T05:00:00,' + toDate.format('YYYY-MM-DD') + 'T05:00:00]'

  const perPage = 50
  getAccountsPromise(req, { createdAt: createdAt, limit: 1, offset: 0 }).then(accounts => {
    const pages = Math.ceil(accounts.size / perPage)
    const promises = []
    for (let p = 0; p < pages; p++) {
      promises.push(getAccountsPromise(req, {
        createdAt,
        limit: perPage,
        offset: p * perPage,
        expand: 'customData'
      }))
    }

    Promise.all(promises).then((results) => {
      let allAccounts = []
      for (let r = 0; r < pages; r++) {
        allAccounts = allAccounts.concat(results[r].items)
      }
      console.log('customData', allAccounts[0].customData)
      res.status(200).send(allAccounts.filter(acct => {
        return acct.email && acct.email.indexOf('conveyal.com') === -1
      }))
    })
    .catch((err) => {
      console.log(err)
      res.status(501).send(err)
    })
  })
})

function getAccountsPromise (req, params) {
  return new Promise((resolve, reject) => {
    req.stormpathClient.getAccounts(params, (err, accounts) => {
      if (err) {
        reject(err)
      } else {
        resolve(accounts)
      }
    })
  })
}

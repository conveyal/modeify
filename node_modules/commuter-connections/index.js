import soap from 'soap'

/**
 * Base URL for requests from Commuter Connections
 */

export const URL = 'http://mwcog.mediabeef.com/QuickMatchService/services/QuickMatchService?wsdl'

/**
 * Make a SOAP request to [Commuter Connections](http://www.commuterconnections.org/) to get the number of carpools available for a given starting, ending location, and search radius.
 *
 * @param {Object} opts Options object
 * @returns {Promise} promise
 * @example
 * import {findMatches} from 'commuter-connections'
 * findMatches({
 *   startLat: 39.0436,
 *   startLng: -77.4875,
 *   endLat: 38.9047,
 *   endLng: -77.0164,
 *   startRadius: 2,
 *   endRadius: 2
 * }).then((matches) => {
 *   console.log(matches) // # of matches found
 * }, handleError)
 */

export function findMatches (opts = {}) {
  return new Promise((resolve, reject) => {
    createSoapClient()
      .then((client) => {
        const errors = verifyFindMatchesOptions(opts)
        if (errors.length > 0) return reject(errors)
        client.getQuickMatchesByLatLng(opts, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(parseInt(res.return, 10))
          }
        })
      }, reject)
  })
}

/**
 * Verify find the options required for `findMatches`
 *
 * @param {Object} opts Options object
 * @returns {Array} errors Errors found in the options
 * @example
 * import {verifyFindMatchesOptions} from 'commuter-connections'
 * const errors = verifyFindMatchesOptions(opts)
 * if (errors.length > 0) handleErrors(errors)
 */

export function verifyFindMatchesOptions (opts = {}) {
  const errors = []
  if (!opts.startLat) errors.push('Missing starting latitude.')
  if (!opts.startLng) errors.push('Missing starting longitude.')
  if (!opts.endLat) errors.push('Missing ending latitude.')
  if (!opts.endLng) errors.push('Missing ending longitude.')
  if (!opts.startRadius) errors.push('Missing starting radius.')
  if (!opts.endRadius) errors.push('Missing ending radius.')

  return errors
}

/**
 * Create a SOAP client to use with commuter connections.
 *
 * @returns {Promise} promise
 * @example
 * import {createSoapClient} from 'commuter-connections'
 * createSoapClient().then((client) => {
 *   // use the client
 * })
 */

export function createSoapClient () {
  return new Promise((resolve, reject) => {
    if (soapClient) return resolve(soapClient)
    soap.createClient(URL, (err, client) => {
      if (err) reject(err)
      else resolve(client)
    })
  })
}

let soapClient = null

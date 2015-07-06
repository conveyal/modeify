import rbush from 'rbush'
import turfDestination from 'turf-destination'
import turfDistance from 'turf-distance'
import turfPoint from 'turf-point'

/**
 * Make a SOAP request to [Commuter Connections](http://www.commuterconnections.org/) to get the number of carpools available for a given starting, ending location, and search radius.
 *
 * @param {Array} commuters Array of commuters to match to each other
 * @param {Object} opts Options object
 * @returns {Promise} promise
 * @example
 * import {findMatches} from 'commuter-connections'
 * findMatches({
 *   commuters: [{
 *     _id: 1,
 *     from: [-77.4875, 39.0436],
 *     to: [..]
 *   }], {
 *     radius: .5,
 *     units: 'miles'
 * }}).then((matches) => {
 *     console.log(matches) // map of commuter id's to matching commuter id's
 * }, handleError)
 */

export function findMatches (commuters, opts = {}) {
  return new Promise((resolve, reject) => {
    if (!commuters) return reject('No commuters.')

    const tree = rbush()
    tree.load(commuters.map(c => {
      const to = c.to || c.from
      return [ c.from[0], c.from[1], to[0], to[1], c ]
    }))

    const responses = {}
    const RADIUS = opts.radius || 0.25
    const DIST = RADIUS * Math.sqrt(2)
    const UNITS = opts.units || 'miles'

    commuters.forEach(commuter => {
      const fromPoint = turfPoint(commuter.coordinates)

      // construct bbox
      const bottomLeft = turfDestination(fromPoint, DIST, -135, UNITS)
      const topRight = turfDestination(fromPoint, DIST, 45, UNITS)

      // do the initial bbox search
      const results = tree.search(bottomLeft.geometry.coordinates.concat(topRight.geometry.coordinates))

      // filter the matches
      const matches = results.reduce((matches, result) => {
        const match = result[4]._id
        const matchPoint = turfPoint([result[0], result[1]])

        // ignore self match
        if (match === commuter._id) return matches

        // ignore matches where distance exceeds search radius
        const distance = turfDistance(fromPoint, matchPoint)
        if (distance > RADIUS) return matches

        matches.push({
          _id: match,
          distance: distance
        })
        return matches
      }, [])

      responses[commuter._id] = matches
    })

    resolve(responses)
  })
}

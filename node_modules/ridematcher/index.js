import rbush from 'rbush'
import turfDestination from 'turf-destination'
import turfDistance from 'turf-distance'
import turfPoint from 'turf-point'

/**
 * Compute the number of potential carpool matches within a commuter population.
 *
 * @param {Array} commuters Array of commuters to match to each other
 * @param {Object} opts Options object
 * @returns {Promise} promise
 * @example
 * import {findMatches} from 'ridematcher'
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
      const fromPoint = turfPoint(commuter.from)

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
        const distance = turfDistance(fromPoint, matchPoint, UNITS)
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


/**
 * Find matches for a single commute against a set of car/vanpools
 *
 * @param {Array} from Search origin lng/lat
 * @param {Array} to Search destination lng/lat
 * @param {Array} ridepools Array of car/vanpools to match against
 * @param {Object} opts Options object
 * @returns {Promise} promise
 * @example
 * import {findRidepoolMatches} from 'ridematcher'
 * findMatches(
 *   from: [-77.4875, 39.0436],
 *   to: [..],
 *   ridepools: [{
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

export function findRidepoolMatches (from, to, ridepools, opts = {}) {
  return new Promise((resolve, reject) => {
    if (!ridepools) return reject('No ridepools.')

    const fromTree = rbush()
    fromTree.load(ridepools.map(r => {
      return [ r.from[0], r.from[1], r.from[0], r.from[1], r ]
    }))

    const toTree = rbush()
    toTree.load(ridepools.map(r => {
      return [ r.to[0], r.to[1], r.to[0], r.to[1], r ]
    }))

    const responses = {}
    const RADIUS = opts.radius || 0.25
    const DIST = RADIUS * Math.sqrt(2)
    const UNITS = opts.units || 'miles'

    const fromPoint = turfPoint(from)
    const toPoint = turfPoint(to)

    // find the pools matching the 'from' search point
    const fromBottomLeft = turfDestination(fromPoint, DIST, -135, UNITS)
    const fromTopRight = turfDestination(fromPoint, DIST, 45, UNITS)

    let s = fromBottomLeft.geometry.coordinates.concat(fromTopRight.geometry.coordinates)
    let fromMatches = fromTree.search(s)
    fromMatches = fromMatches.filter(function(match) {
      let distance = turfDistance(fromPoint, turfPoint([match[0], match[1]]), UNITS)
      return distance <= RADIUS
    }).map(function(match) { return match[4] })

    // find the pools matching the 'to' search point
    const toBottomLeft = turfDestination(toPoint, DIST, -135, UNITS)
    const toTopRight = turfDestination(toPoint, DIST, 45, UNITS)

    let toMatches = toTree.search(toBottomLeft.geometry.coordinates.concat(toTopRight.geometry.coordinates))
    toMatches = toMatches.filter(function(match) {
      let distance = turfDistance(toPoint, turfPoint([match[0], match[1]]), UNITS)
      return distance <= RADIUS
    }).map(function(match) { return match[4] })

    // return the intersection of the two match sets
    resolve(fromMatches.filter(function(n) {
        return toMatches.indexOf(n) != -1
    }))
  })
}

/**
 * List of third-party resources defined as an array of objects.
 *
 * Available resource object properties:
 *  - modes: array of mode[s] that this resource applies to; if any of these
 *      matches any of the route's mode[s], then this resource matches
 *  - modes-only: same as above except only matches single-mode routes (e.g.
*       walk-only, bike-only routes)
 *  - title: name of this resource to display
 *  - description: short description of resource to display
 */

module.exports = [{
  modes : ['bicycle'],
  title : "BikeArlington",
  description: "Let BikeArlington help you plan your trip!"
}, {
  'modes-only' : ['walk'],
  title : "WalkArlington",
  description: "Let WalkArlington help you plan your trip!"
}];
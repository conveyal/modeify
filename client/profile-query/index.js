var clone = require('clone')
var defaults = require('model-defaults')
var model = require('model')

var ProfileRequest = module.exports = model('ProfileRequest')
  .use(defaults({
    accessModes: [],
    bikeSafe: 1,
    bikeSlope: 1,
    bikeSpeed: 4.1,
    bikeTime: 1,
    date: new Date(),
    directModes: [],
    endTime: 9,
    egressModes: [],
    from: [],
    limit: 2,
    startTime: 8,
    to: [],
    transitModes: [],
    walkSpeed: 1.4
  }))
  .attr('accessModes')
  .attr('bikeSafe')
  .attr('bikeSlope')
  .attr('bikeSpeed')
  .attr('bikeTime')
  .attr('date')
  .attr('directModes')
  .attr('endTime')
  .attr('egressModes')
  .attr('from')
  .attr('limit')
  .attr('startTime')
  .attr('to')
  .attr('transitModes')
  .attr('walkSpeed')

var arrays = ['accessModes', 'directModes', 'egressModes', 'from', 'to', 'transitModes']
var floats = ['bikeSpeed', 'walkSpeed']
var ints = ['bikeSafe', 'bikeSlope', 'bikeTime', 'endTime', 'limit', 'startTime']

ProfileRequest.fromJSON = function (json) {
  var attrs = clone(json)

  arrays.forEach(function (k) {
    attrs[k] = attrs[k] ? attrs[k].split(',') : []
  })

  floats.forEach(function (k) {
    attrs[k] = parseFloat(attrs[k])
  })

  ints.forEach(function (k) {
    attrs[k] = parseInt(attrs[k], 10)
  })

  attrs.date = new Date(attrs.date)
  attrs.from = [parseFloat(attrs.from[0]), parseFloat(attrs.from[1])]
  attrs.to = [parseFloat(attrs.to[0]), parseFloat(attrs.to[1])]

  return new ProfileRequest(attrs)
}

ProfileRequest.prototype.toJSON = function () {
  var pr = clone(this.attrs)

  arrays.forEach(function (k) {
    pr[k] = pr[k].join(',')
  })

  pr.date = pr.date.toISOString().split('T')[0]
  pr.endTime = pr.endTime + ':00'
  pr.startTime = pr.startTime + ':00'

  return pr
}

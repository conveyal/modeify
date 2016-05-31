var moment = require('moment')

var View = require('../view')(require('./row.html'))

var dateFormat = 'ddd, MMM D, YYYY'

View.prototype.formatFromDate = function () {
  return moment(this.model.get('fromDate')).format(dateFormat)
}

View.prototype.formatToDate = function () {
  return moment(this.model.get('toDate')).format(dateFormat)
}

module.exports = View

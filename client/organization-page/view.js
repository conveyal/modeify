var alerts = require('alerts')
var log = require('./client/log')('organization-page:view')
var page = require('page')
var view = require('view')
var request = require('request')
var spin = require('spinner')
var file = require('file')
var filePicker = require('file-picker')
var csvToArray = require('csv-to-array')

/**
 * Expose `View`
 */

var View = module.exports = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Organization Page'
})

var LocationRow = view(require('./location.html'))

View.prototype['locations-view'] = function () {
  return LocationRow
}

var RidepoolRow = view(require('./ridepool.html'))

RidepoolRow.prototype.remove = function () {
  var self = this
  if (window.confirm('Delete ridepool ' + this.model.get('name') + '?')) {
    request.del('/ridepools/' + this.model.get('_id'), function (err) {
      if (err) {
        console.error(err)
        window.alert(err)
      } else {
        self.el.remove()
      }
    })
  }
}

View.prototype['ridepools-view'] = function () {
  return RidepoolRow
}

View.prototype.ridepoolCSV = function (e) {
  var view = this
  var spinner = spin()
  filePicker({
    accept: ['.csv']
  }, function (files) {
    var csv = file(files[0])
    csv.toText(function (err, text) {
      if (err) log.error(err)
      spinner.remove()

      var ridepools = csvToArray(text)
      ridepools = ridepools.map(function(ridepool) {
        ridepool.created_by = view.model.get('_id')
        return ridepool
      })

      request.post('/ridepools/batch', ridepools, function (err, res) {
        if (err) {
          alert('Error uploading: ' + err)
        } else {
          page('/manager/organizations/' + view.model.get('_id') + '/show')
        }
      })
    })
  })
}

/**
 * Destroy
 */

View.prototype.destroy = function (e) {
  if (window.confirm('Delete organization?')) {
    this.model.destroy(function (err) {
      if (err) {
        log.error('%e', err)
        window.alert(err)
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted organization.'
        })
        page('/manager/organizations')
      }
    })
  }
}

var alerts = require('alerts')
var log = require('./client/log')('organization-page:view')
var page = require('page')
var view = require('view')

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

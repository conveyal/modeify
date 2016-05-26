var page = require('page')
var User = require('../user')
var view = require('../view')
var log = require('../log')('location-ridematch-settings')

var View = view(require('./template.html'))

module.exports = function (ctx, next) {
  console.log(ctx.location)
  User.getManagersForOrg(ctx.organization._id(), function (err, managers) {
    if (err) {
      log.error(err)
      window.alert(err)
    }
    ctx.view = new View({
      organization: ctx.organization,
      location: ctx.location,
      managers: managers
    })
    next()
  })
}

var ManagerOption = view(require('./manager.html'))

View.prototype['managers-view'] = function () {
  return ManagerOption
}

View.prototype.save = function () {
  var self = this
  var notifyManager = this.find('.notify-manager').checked
  var selectedManager = notifyManager ? this.model.managers[this.find('.manager-select').selectedIndex] : null
  this.model.location.rideshare_manager(selectedManager ? selectedManager.href().split('/').pop() : null)
  this.model.location.save(function (err) {
    if (err) {
      log.error(err)
      window.alert(err)
    }
    page.redirect('/organizations/' + self.model.organization._id() + '/locations/' + self.model.location._id() + '/show')
  })
}

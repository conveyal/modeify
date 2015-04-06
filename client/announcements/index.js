var config = require('config')
var log = require('./client/log')('announcements')
var modal = require('modal')
var raf = require('raf')
var session = require('session')

var Modal = modal({
  height: '500px',
  noPadding: true,
  template: require('./template.html')
}, function (view, model) {
  view.nextAnnouncement()
  raf(function () {
    view.setStyled()
  })
})

module.exports = function showAnnouncements (ctx, next) {
  var autoshow = arguments.length === 0
  var modal
  var profile = session.commuter().profile()

  if (profile.welcome_wizard_complete) {
    var unnseen = getUnseenAnnouncements(profile.announcements_seen)
    if (unnseen.length > 0) {
      log('welcome complete, showing announcements')
      modal = new Modal({
        announcements: unnseen
      })
    } else {
      log('no announcements to show')
    }
  } else {
    log('welcome incomplete, not showing announcements')
  }

  if (!autoshow) {
    ctx.modal = modal
    next()
  } else if (modal) {
    modal.show()
  }
}

Modal.prototype.nextAnnouncement = function () {
  var announcement = this.model.announcements.shift()
  if (announcement) {
    this.setBackgroundImage(announcement.image)
    this.commuterHasSeenAnnouncement(announcement.id)
  } else {
    this.hide()
  }
}

Modal.prototype.commuterHasSeenAnnouncement = function (id) {
  var commuter = session.commuter()
  var profile = commuter.profile()

  profile.announcements_seen = profile.announcements_seen || []
  profile.announcements_seen.push(id)

  commuter.profile(profile)
  commuter.save()
}

Modal.prototype.setBackgroundImage = function (image) {
  if (image.indexOf('http') === -1) image = config.static_url() + '/images/application/' + image
  this.el.style.backgroundImage = 'url(' + image + ')'
}

Modal.prototype.setStyled = function () {
  this.find('button').classList.add('is-styled')
  this.el.classList.add('is-styled')
}

function getUnseenAnnouncements (seenAnnouncements) {
  var announcements = config.announcements ? config.announcements() : []
  var unnseen = []
  for (var i = 0; i < announcements.length; i++) {
    var id = announcements[i].id
    if (seenAnnouncements.indexOf(id) === -1) {
      unnseen.push(announcements[i])
    }
  }
  return unnseen
}

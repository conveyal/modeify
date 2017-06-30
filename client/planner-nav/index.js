const Remarkable = require('remarkable')
const md = new Remarkable()

var config = require('../config')
var evnt = require('component-event')
var MarkdownModal = require('../markdown-modal')
var showWalkThrough = require('../planner-walkthrough')
var page = require('page')
var view = require('../view')
var _tr = require('../translate')

var aboutContent = md.render(config.About())
var termsContent = md.render(config.Terms())

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, model) {
  _tr.inHTML(view, 'a')
})

/**
 * Scroll to top
 */

View.prototype.scrollToTop = function (e) {
  if (e.target.href) { // Let it go through when clicking a link
    window.open(e.target.href, '_blank')
  } else {
    e.preventDefault()
    document
      .getElementById('scrollable')
      .scrollTop = 0
  }
}

View.prototype.showMenu = function () {
  var menu = this.find('.menu')
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden')
    evnt.bind(document.documentElement, 'click', this.hideMenu.bind(this))
  } else {
    this.hideMenu()
  }
}

View.prototype.hideMenu = function () {
  this.find('.menu').classList.add('hidden')
  evnt.unbind(document.documentElement, 'click', this.hideMenu.bind(this))
}

View.prototype.showProfile = function (e) {
  if (e) e.preventDefault()
  this.hideMenu()
  page('/profile')
}

View.prototype.showAbout = function (e) {
  if (e) e.preventDefault()
  this.hideMenu()
  MarkdownModal({
    content: aboutContent
  }).show()
}

View.prototype.showTermsAndConditions = function (e) {
  if (e) e.preventDefault()
  this.hideMenu()
  MarkdownModal({
    content: termsContent
  }).show()
}

View.prototype.organizationUrl = function () {
  return config.organization().url
}

/**
 * Show Walk Through
 */

View.prototype.showWalkThrough = function (e) {
  if (e) e.preventDefault()
  this.hideMenu()
  showWalkThrough()
}

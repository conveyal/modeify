var fs = require('fs')
var config = require('../config')
var evnt = require('component-event')
var MarkdownModal = require('../markdown-modal')
var showWalkThrough = require('../planner-walkthrough')
var getTemplate = require('../template')
var page = require('page')
var view = require('../view')

require('./style.css')

/**
 * Expose `View`
 */

var View = module.exports = view(fs.readFileSync(__dirname + '/template.html'))

/**
 * Scroll to top
 */

View.prototype.scrollToTop = function (e) {
  e.preventDefault()
  document
    .getElementById('scrollable')
    .scrollTop = 0
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
    content: getTemplate('about')
  }).show()
}

View.prototype.showTermsAndConditions = function (e) {
  if (e) e.preventDefault()
  this.hideMenu()
  MarkdownModal({
    content: getTemplate('terms')
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

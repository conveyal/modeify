require('manager-router')

var Nav = require('manager-nav')
var onLoad = require('on-load')
var page = require('page')
var session = require('session')

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function () {
  // display nav
  var nav = new Nav(session)
  document.body.insertBefore(nav.el, document.body.firstChild)

  // set base
  page.base('/manager')

  // listen
  page()
})

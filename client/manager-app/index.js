require('es5-shim')
require('es6-shim')
require('html5-history-api')
require('../manager-router')

var Nav = require('../manager-nav')
var onLoad = require('../../components/ianstormtaylor/on-load/0.0.2')
var page = require('page')
var session = require('../session')

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

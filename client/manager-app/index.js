require('es5-shim')
require('es6-shim')
require('html5-history-api')
require('../manager-router')

const auth0lock = require('../auth0')
var Nav = require('../manager-nav')
var onLoad = require('../components/ianstormtaylor/on-load/0.0.2')
var page = require('page')
var session = require('../session')

auth0lock.setLoginCallback((err) => {
  if (err) {
    return alert('Login failed!')
  }

  if (!session.user().isAdmin()) {
    alert('Unauthorized!')
    window.location = '/'
    return
  }

  doLoad()
})

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(function () {
  const user = session.user()
  if (!user || !user.isAdmin()) {
    return auth0lock.show()
  }

  doLoad()
})

function doLoad () {
  // display nav
  var nav = new Nav(session)
  document.body.insertBefore(nav.el, document.body.firstChild)

  // set base
  page.base('/manager')

  // listen
  page()
}

/* globals alert */

require('es5-shim')
require('es6-shim')
require('html5-history-api')

var Nav = require('../manager-nav')
require('../manager-router')
var onLoad = require('../components/ianstormtaylor/on-load/0.0.2')
var page = require('page')
var session = require('../session')

/**
 * Once the browser has "loaded"...ugh, can't believe we still need this.
 */

onLoad(() => {
  session.touch({}, () => {
    const user = session.user()
    if (!user || !user.isAdmin()) {
      return session.login((err) => {
        if (err) {
          alert('Login failed!')
          window.location = '/'
          return
        }

        if (!session.user().isAdmin()) {
          alert('Unauthorized!')
          window.location = '/'
          return
        }

        doLoad()
      })
    } else {
      doLoad()
    }
  })
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

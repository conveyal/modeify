var analytics = require('analytics')
var Page404 = require('404-page')
var log = require('./client/log')('router-utils')
var page = require('page')

/**
 * Cache `main` & `view`
 */

var $main = document.getElementById('main')
var view = null

/**
 * Expose `render`
 */

module.exports.render = function (ctx, next) {
  if (ctx.redirect) {
    log('redirecting from %s to %s', decodeURIComponent(ctx.path), ctx.redirect)
    return page.redirect(ctx.redirect + window.location.search)
  }

  // if no redirect, render the view
  log('render %s', decodeURIComponent(ctx.path))

  // remove old view if we're not showing a modal
  if (view && !ctx.modal) {
    $main.innerHTML = ''
    view.off()
    if (view.el && view.el.remove) view.el.remove()
    if (view.category) $main.classList.remove(view.category)
    view = null
  }

  if (!view) {
    // if no view has been created or ther was an error, create an error page
    if (!ctx.view || ctx.error) ctx.view = new Page404(ctx.error || {})

    // Store the new view
    view = ctx.view

    // Add the category as a class
    if (view.category) $main.classList.add(view.category)

    $main.appendChild(view.el)
    view.emit('rendered', view)
  }

  if (ctx.modal) {
    ctx.modal.show()
  }

  // track the page view
  analytics.page()
}

module.exports.redirect = function (to) {
  return function (ctx, next) {
    log('redirecting from %s to %s', ctx.path, to)
    page.redirect(to + window.location.search)
  }
}

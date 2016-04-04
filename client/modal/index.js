var config = require('./client/config')
var log = require('./client/log')('modal')
var createModal = require('modal')
var raf = require('raf')
var scrollbarSize = require('scrollbar-size')
var view = require('view')

/**
 * Store the active modal
 */

var active = null

/**
 * Events
 */

var events = ['showing', 'show', 'hiding', 'hide']

/**
 * Expose `modal`
 */

module.exports = function (opts, fn) {
  if (opts.closable) opts.template = require('./closable.html') + opts.template
  if (!opts.noPadding) opts.template = '<div class="content">' + opts.template + '</div>'

  // Wrap with a logo nav
  if (opts.logo) opts.template = '<div><a class="logo" href="' + config.organization().url + '"></a>' + opts.template + '</div>'

  var Modal = view(opts, fn)

  /**
   * Show Modal
   */

  Modal.prototype.show = function (fn) {
    log('showing modal')

    var modal = this.modal = createModal(this.el).overlay()
    var el = modal.el
    var view = this

    // Bind hide (had to override)
    modal.hide = this.hide.bind(this)

    // Bubble up all of the events
    events.forEach(function (e) {
      view.modal.on(e, function () {
        view.emit(e)
      })
    })

    if (opts.height) modal.el.style.height = opts.height
    if (opts.width) modal.el.style.maxWidth = opts.width
    if (opts.closable) modal.closable()

    modal.hidden = false
    modal.animating = true
    modal.emit('showing')

    // Custom ".show" function adopted from segmentio/showable
    raf(function () {
      if (active) active.hide()
      active = view

      // Set the scrollbar size
      var div = el.querySelector('div')

      if (scrollbarSize > 0) {
        div.style.marginRight = -scrollbarSize + 'px'
      }

      // Wait until the modal is displayed before setting the height
      raf(function () {
        var height = el.clientHeight
        var offset = el.offsetTop
        var windowHeight = window.innerHeight

        if ((height + offset) > windowHeight) {
          el.style.height = (windowHeight - offset) + 'px'
        }
      })

      modal.animating = false
      modal.emit('show')
      if (fn) fn()
    })

    el.classList.remove('hidden')
  }

  /**
   * Hide Modal
   */

  Modal.prototype.hide = function (fn) {
    log('hiding modal')

    // Custom hide adopted from segmentio/showable
    if (this.modal) {
      var modal = this.modal

      if (modal.hidden === null) {
        modal.hidden = modal.el.classList.contains('hidden')
      }

      if (modal.hidden || modal.animating) return this

      modal.hidden = true
      modal.animating = true

      raf(function () {
        modal.animating = false
        modal.emit('hide')
        modal._overlay.el.remove()
        if (typeof fn === 'function') fn()
      })

      modal.el.classList.add('hidden')
      modal.emit('hiding')
    }

    return this
  }

  return Modal
}

/**
 * Hide any active modal
 */

module.exports.hide = function (e) {
  if (active) active.hide(e)
}

var closest = require('closest');
var config = require('config');
var debug = require('debug')(config.application() + ':locations-view');
var geocode = require('geocode');
var hogan = require('hogan.js');
var mouse = require('mouse-position');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  plan) {
  view.on('rendered', function() {
    closest(view.el, 'form').onsubmit = function(e) {
      e.preventDefault();

      plan.setAddresses(view.find('.from input').value, view.find('.to input').value, function(err) {
        if (err) {
          debug(err);
        } else {
          plan.updateRoutes();
        }
      });
    };
  });
});

/**
 * Address Changed
 */

View.prototype.blurInput = function(e) {
  debug('input blurred, saving changes');
  var inputGroup = e.target.parentNode;
  var suggestionList = inputGroup.getElementsByTagName('ul')[0];
  var elementUnderMouse = document.elementFromPoint(mouse.x, mouse.y);

  if (elementUnderMouse && elementUnderMouse.classList.contains('suggestion'))
    e.target.value = elementUnderMouse.innerText;

  suggestionList.innerHTML = '';
  inputGroup.classList.remove('highlight');
  this.save(e.target);
};

/**
 * Geocode && Save
 */

View.prototype.save = function(el, callback) {
  var plan = this.model;
  this.model.setAddress(el.name, el.value, function(err) {
    if (err) {
      debug(err);
      window.alert('Invalid address.');
    } else {
      plan.updateRoutes();
    }
  });
};

/**
 * Highlight the selected input
 */

View.prototype.focusInput = function(e) {
  e.target.parentNode.classList.add('highlight');
};

/**
 * Suggestions Template
 */

var suggestionsTemplate = hogan.compile(require('./suggestions.html'));

/**
 * Suggest
 */

View.prototype.suggest = function(e) {
  var input = e.target;
  var text = input.value || '';
  var name = input.name;
  var inputGroup = input.parentNode;
  var suggestionList = inputGroup.getElementsByTagName('ul')[0];

  // If the text is too short or does not contain a space yet, return
  if (text.length < 4 || text.indexOf(' ') === -1 || text.lastIndexOf(' ') + 1 === text.length) return;

  // Get a suggestion!
  geocode.suggest(text, function(err, suggestions) {
    if (err) {
      debug(err);
    } else {
      suggestionList.innerHTML = suggestionsTemplate.render({
        suggestions: suggestions
      });
    }
  });
};

/**
 * Clear
 */

View.prototype.clear = function(e) {
  e.preventDefault();
  var inputGroup = e.target.parentNode;
  var input = inputGroup.getElementsByTagName('input')[0];
  input.value = '';
  input.focus();
};

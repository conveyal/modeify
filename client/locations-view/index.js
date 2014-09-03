var closest = require('closest');
var each = require('each');
var geocode = require('geocode');
var hogan = require('hogan.js');
var log = require('log')('locations-view');
var mouse = require('mouse-position');
var textModal = require('text-modal');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view,
  plan) {
  view.on('rendered', function() {
    closest(view.el, 'form').onsubmit = function(e) {
      e.preventDefault();

      plan.setAddresses(view.find('.from input').value, view.find(
        '.to input').value, function(err) {
        if (err) {
          log.error('%j', err);
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
  log.info('input blurred, saving changes');
  var inputGroup = e.target.parentNode;
  var suggestionList = inputGroup.getElementsByTagName('ul')[0];

  var highlight = this.find('.suggestion.highlight');
  if (highlight) e.target.value = highlight.innerText;

  suggestionList.classList.add('empty');
  setTimeout(function() {
    suggestionList.innerHTML = '';
  }, 250);

  inputGroup.classList.remove('highlight');
  this.save(e.target);
};

/**
 * Keypress
 */

View.prototype.keydownInput = function(e) {
  var el = e.target;
  var key = e.keyCode;

  // Currently highlighted suggestion
  var current = this.find('.suggestion.highlight');

  // Save?
  if (key === 13) {
    this.blurInput(e);
  } else if (key === 38 || key === 40) {
    // Up
    if (key === 38 && current) {
      if (current.previousElementSibling) {
        current.previousElementSibling.classList.add('highlight');
      } else {
        el.value = this.currentLocation;
        el.setSelectionRange(el.value.length - 1, el.value.length);
      }
      current.classList.remove('highlight');
    }

    // Down
    if (key === 40) {
      if (!current) {
        var suggestion = this.find('.suggestion');
        if (suggestion) suggestion.classList.add('highlight');
      } else if (current.nextElementSibling) {
        current.nextElementSibling.classList.add('highlight');
        current.classList.remove('highlight');
      }
    }

    var newHighlight = this.find('.suggestion.highlight');
    if (newHighlight) el.value = newHighlight.innerText;
  } else if (current) {
    el.value = this.currentLocation;
    el.selectionStart = el.selectionEnd = el.value.length;
    current.classList.remove('highlight');
  } else {
    this.currentLocation = el.value;
  }
};

/**
 * Geocode && Save
 */

View.prototype.save = function(el, callback) {
  var plan = this.model;
  if (plan[el.name]() === el.value) return;

  this.model.setAddress(el.name, el.value, function(err) {
    if (err) {
      log.error('%j', err);
      textModal('Invalid address.');
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
  var view = this;

  // If the text is too short or does not contain a space yet, return
  if (text.length < 4 || text.indexOf(' ') === -1 || text.lastIndexOf(' ') + 1 ===
    text.length) return;

  // Get a suggestion!
  geocode.suggest(text, function(err, suggestions) {
    if (err) {
      log.error('%j', err);
    } else {
      if (suggestions && suggestions.length > 0) {
        suggestionList.innerHTML = suggestionsTemplate.render({
          suggestions: suggestions
        });

        each(view.findAll('.suggestion'), function(li) {
          li.onmouseover = function(e) {
            li.classList.add('highlight');
          };

          li.onmouseout = function(e) {
            li.classList.remove('highlight');
          };
        });

        suggestionList.classList.remove('empty');
      } else {
        suggestionList.classList.add('empty');
      }
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

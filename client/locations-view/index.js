var closest = require('closest');
var each = require('each');
var geocode = require('geocode');
var hogan = require('hogan.js');
var log = require('./client/log')('locations-view');
var mouse = require('mouse-position');
var textModal = require('text-modal');
var view = require('view');
var analytics = require('analytics');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, plan) {
		view.on('rendered', function() {
			closest(view.el, 'form').onsubmit = function(e) {
			e.preventDefault();

			plan.setAddresses(view.find('.from input').value, view.find('.to input').value, function(err) {
				if (err) {
				log.error('%e', err);
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
	log('input blurred, saving changes');

	var inputGroup = e.target.parentNode;
	var suggestionList = inputGroup.getElementsByTagName('ul')[0];
	inputGroup.classList.remove('suggestions-open');

	var highlight = this.find('.suggestion.highlight');
	if (highlight) {
		e.target.value = highlight.textContent || '';
		if (highlight.dataset.lat) {
			e.target.lat = highlight.dataset.lat;
			e.target.lng = highlight.dataset.lng;
			e.target.address = highlight.addressData;
		}
	}

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
	var highlightedSuggestion = this.find('.suggestion.highlight');

	switch (key) {
		case 13: // enter key
			e.preventDefault();
			this.blurInput(e);
			break;
		case 38: // up key
		case 40: // down key
			if (key === 38) {
				this.pressUp(highlightedSuggestion, el);
			} else {
				this.pressDown(highlightedSuggestion, el);
			}

			var newHighlight = this.find('.suggestion.highlight');
			if (newHighlight) el.value = newHighlight.textContent || '';
			break;
	}
};

/**
 * Press Up
 */

View.prototype.pressUp = function(highlightedSuggestion, el) {
	if (highlightedSuggestion) {
		var aboveHighlightedSuggestion = highlightedSuggestion.previousElementSibling;

		if (aboveHighlightedSuggestion) {
			aboveHighlightedSuggestion.classList.add('highlight');
		} else {
			el.value = this.currentLocation || '';
			setCursor(el, el.value.length);
		}
		highlightedSuggestion.classList.remove('highlight');
	}
};

/**
 * Press Down
 */

View.prototype.pressDown = function(highlightedSuggestion, el) {
	if (!highlightedSuggestion) {
		var suggestion = this.find('.suggestion');
		if (suggestion) suggestion.classList.add('highlight');
	} else if (highlightedSuggestion.nextElementSibling) {
		highlightedSuggestion.nextElementSibling.classList.add('highlight');
		highlightedSuggestion.classList.remove('highlight');
	}
};

/**
 * Geocode && Save
 */

View.prototype.save = function(el) {
	var plan = this.model;
	var name = el.name;
	var val = el.value;
	if (!val || plan[name]() === val) return;

	if (el.lat) {
		this.model.setAddress(name, el.lng + ',' + el.lat, function(err, location) {
				if (err) {
				log.error('%e', err);
				analytics.send_ga({
category: 'geocoder',
action: 'change address invalid',
label: val,
value: 0
});
				textModal('Invalid address.');
				} else if (location && plan.validCoordinates()) {
				analytics.send_ga({
category: 'geocoder',
action: 'change address success',
label: val,
value: 0
});
				plan.updateRoutes();
				}
				}, el.address);
} else {
	this.model.setAddress(name, val, function(err, location) {
			if (err) {
			log.error('%e', err);
			analytics.send_ga({
category: 'geocoder',
action: 'change address invalid',
label: val,
value: 0
});
			textModal('Invalid address.');
			} else if (location && plan.validCoordinates()) {
			analytics.send_ga({
category: 'geocoder',
action: 'change address success',
label: val,
value: 0
});
			plan.updateRoutes();
			}
			});
}
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
var suggestionTimeout;

function getAddress(s) {
  var city = '';
  if(s.city) 
    city = s.city;
  else if(s.town) 
    city = s.town;
  else if(s.village)
    city = s.village;
  else if(s.hamlet)
    city = s.hamlet;

  var street = '';
  if(s.road)
    street = s.road;
  else if(s.pedestrian)
    street = s.pedestrian;
  else if(s.footway)
    street = s.footway;
  else if(s.industrial)
    street = s.industrial;
  else if(s.cycleway)
    street = s.cycleway;

  var number = '';
  if(s.house_number) 
    number = s.house_number;
  else if(s.parking)
    number = s.parking;

  var place = '';
  if(s.aerodrome) 
    place = s.aerodrome + ', ' + city;
  else if(s.stadium) 
    place = s.stadium + ', ' + city;
  else if(s.school)
    place = s.school + ', ' + city;
  else if(s.museum)
    place = s.museum + ', ' + city;
  else if(s.restaurant)
    place = s.restaurant + ', ' + street + ', ' + city;
  else if(s.cafe)
    place = s.cafe + ', ' + street + ', ' + city;
  else if(s.pub)
    place = s.pub + ', ' + street + ', ' + city;  
  else if(s.bar)
    place = s.bar + ', ' + street + ', ' + city;
  else if(s.fast_food)
    place = s.fast_food + ', ' + street + ', ' + city;
  else if(s.place_of_worship)
    place = s.place_of_worship + ', ' + street + ', ' + city;

  if(place.length > 0)
    return place;
  else 
    return $.grep([number, street, city, s.state], Boolean).join(", ")  
}

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
  var suggestionsData = [];
  var resultsCallbackAmigo = function(err, suggestions) {
    if (err) {
      log.error('%e', err);
    } else {
        if (suggestions && suggestions.length > 0) {
            for (var i = 0; i < suggestions.length; i++) {

                if (item_suggestions.country_a == "USA" && item_suggestions.region_a == "CA")  {

                    item_suggestions = suggestions[i].properties;
                    item_geometry = suggestions[i].geometry;

                    suggestion_obj = {
                        "index" : i,
                        "text" : item_suggestions.label,
                        "lat" : item_geometry.coordinates[0],
                        "lon" : item_geometry.coordinates[1],
                        "magicKey": ""
                    };
                    suggestionsData.push(suggestion_obj);
                }

            }

            suggestionsData = suggestionsData.slice(0, 5);
            suggestionList.innerHTML = suggestionsTemplate.render({
                suggestions: suggestionsData
            });
            /*******************/
                each(view.findAll('.suggestion'), function(li) {
                    li.addressData = suggestions[li.dataset.index];

                      li.onmouseover = function(e) {
                        li.classList.add('highlight');
                      };

                      li.onmouseout = function(e) {
                        li.classList.remove('highlight');
                      };
                });

                suggestionList.classList.remove('empty');
                inputGroup.classList.add('suggestions-open');
            /*******************/
        }

        else {
            suggestionList.classList.add('empty');
            inputGroup.classList.remove('suggestions-open');
        }
    }
  }

  var resultsCallback = function(err, suggestions) {
    if (err) {
      log.error('%e', err);
    } else {
      if (suggestions && suggestions.length > 0) {
          console.log("-----autocompletado de datos---");
          console.log(suggestions);

          for (var i = 0; i < suggestions.length; i++) {
              if (!suggestions[i].text) {
                 if(suggestions[i].address) {
	           suggestions[i].text = getAddress(suggestions[i].address);
                 } else {
                   suggestions[i].text = suggestions[i].display_name;
                 }
              }
	      suggestions[i].index = i;
	  }
        suggestions = suggestions.slice(0, 5);

        suggestionList.innerHTML = suggestionsTemplate.render({
          suggestions: suggestions
        });

        each(view.findAll('.suggestion'), function(li) {
	    li.addressData = suggestions[li.dataset.index];

          li.onmouseover = function(e) {
            li.classList.add('highlight');
          };

          li.onmouseout = function(e) {
            li.classList.remove('highlight');
          };
        });

        suggestionList.classList.remove('empty');
        inputGroup.classList.add('suggestions-open');
      } else {
        suggestionList.classList.add('empty');
        inputGroup.classList.remove('suggestions-open');
      }
    }
  };

  // If the text is too short or does not contain a space yet, return
  if (text.length < 3) return;

  // Get a suggestion!
  if (suggestionTimeout !== undefined) {
    clearTimeout(suggestionTimeout);
  }
  suggestionTimeout = setTimeout(function () {
    geocode.suggest(text, resultsCallback);
  }, 400);
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

/**
 * Set cursor
 */

function setCursor(node, pos) {
  node = (typeof node === "string" || node instanceof String) ? document.getElementById(node) : node;

  if (!node) return;

  if (node.createTextRange) {
    var textRange = node.createTextRange();
    textRange.collapse(true);
    textRange.moveEnd(pos);
    textRange.moveStart(pos);
    textRange.select();
  } else if (node.setSelectionRange) {
    node.setSelectionRange(pos, pos);
  }

  return false;
}

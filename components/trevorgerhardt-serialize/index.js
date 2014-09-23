
/**
 * Dependencies
 */

var value = require('value')
  , slice = Array.prototype.slice;

/**
 * Populate the form or serialize the form
 */

module.exports = function(el, data) {
  var els = elements(el);

  if (arguments.length === 1) {
    return serialize(els);
  } else {
    populate(els, data);
  }
};

/**
 * Serialize
 */

function serialize(els) {
  var data = {};
  for (var i = 0, el; el = els[i]; i++) {
    var name = el.getAttribute('name');
    if (!data[name]) {
      var val = value(el);
      
      switch (el.type) {
        case 'number':
          val = Number(val);
          break;
        case 'date':
        case 'month':
          val = new Date(val);
          break;
        case 'time':
          var hours = val.split(':')[0]
            , minutes = val.split(':')[1];

          val = new Date();
          val.setHours(hours);
          val.setMinutes(minutes);
          break;
        case 'submit':
        case 'button':
        case 'reset':
          continue; 
      }

      data[name] = val;
    }
  }
  return data;
}

/**
 * Populate
 */

function populate(els, data) {
  for (var i = 0, el; el = els[i]; i++) {
    var val = data[el.getAttribute('name')];
    if (val !== undefined) {

      switch (el.type) {
      case 'date':
      case 'month':
        if (val instanceof Date) {
          var month = add0(val.getMonth() + 1)
            , date = add0(val.getDate());

          val = val.getFullYear() + '-' + month;
          if (el.type === 'date') {
            val += '-' + date;
          }
        }
        break;
      case 'time':
        if (val instanceof Date) {
          var hours = add0(val.getHours())
            , minutes = add0(val.getMinutes());

          val = hours + ':' + minutes;
        }
        break;
      case 'submit':
      case 'button':
      case 'reset':
        continue; 
      }

      value(el, val);
    } 
  }
}

/**
 * Elements
 */

function elements(el) {
  var inputs = slice.call(el.getElementsByTagName('input'))
    , selects = slice.call(el.getElementsByTagName('select'))
    , textareas = slice.call(el.getElementsByTagName('textarea'));

  return inputs.concat(selects).concat(textareas);
}

/**
 * If a number is < 10, add a zero before turning it into a string
 */

function add0(number) {
  return (number > 9 ? number + '' : '0' + number);
}

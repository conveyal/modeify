var convert = require('convert');
var session = require('session');
var view = require('view');

var template = require('./template.html');

var View = module.exports = view(template, function(view) {
  [].slice.call(view.findAll('input')).forEach(setInputSize);
});

/**
 * Input change
 */

View.prototype.inputChange = function(e) {
  e.preventDefault();
  var input = e.target;
  var name = input.name;
  var value = parseFloat(input.value);

  if (!isNaN(value)) {
    var plan = session.plan();
    var scorer = plan.scorer();

    switch (name) {
      case 'bikeSpeed':
        scorer.rates.bikeSpeed = convert.mphToMps(value);
        break;
      case 'tripsPerYear':
        plan.tripsPerYear(value);
        break;
      case 'carParkingCost':
        scorer.rates.carParkingCost = value;
        break;
      case 'transitCost':
        this.model.transitCost(value);
        break;
      case 'vmtRate':
        scorer.rates.mileageRate = value;
        break;
      case 'walkSpeed':
        scorer.rates.walkSpeed = convert.mphToMps(value);
        break;
    }

    plan.rescoreOptions();
  }

  setInputSize(input);
};

/**
 * Set input size
 */

function setInputSize(i) {
  var size = i.value.length || 1;
  i.setAttribute('size', size);
}
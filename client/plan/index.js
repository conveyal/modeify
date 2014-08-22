var Batch = require('batch');
var config = require('config');
var debounce = require('debounce');
var debug = require('debug')(config.name() + ':plan');
var geocode = require('geocode');
var Journey = require('journey');
var Location = require('location');
var defaults = require('model-defaults');
var model = require('model');

var loadPlan = require('./load');
var store = require('./store');
var updateRoutes = require('./update-routes');

/**
 * Debounce updates to once every 50ms
 */

var DEBOUNCE_UPDATES = 25;

/**
 * Expose `Plan`
 */

var Plan = module.exports = model('Plan')
  .use(defaults({
    bike: false,
    bike_speed: 4.1,
    bus: false,
    car: false,
    days: 'M—F',
    end_time: 9,
    from: '',
    from_valid: false,
    options: [],
    per_year: true,
    start_time: 7,
    to: '',
    to_valid: false,
    train: false,
    walk: false,
    walk_speed: 1.4,
    welcome_complete: false
  }))
  .attr('bike')
  .attr('bike_speed')
  .attr('bus')
  .attr('car')
  .attr('days')
  .attr('end_time')
  .attr('from')
  .attr('from_id')
  .attr('from_ll')
  .attr('from_valid')
  .attr('journey')
  .attr('options')
  .attr('original_modes')
  .attr('per_day')
  .attr('per_year')
  .attr('scorer')
  .attr('start_time')
  .attr('to')
  .attr('to_id')
  .attr('to_ll')
  .attr('to_valid')
  .attr('train')
  .attr('walk')
  .attr('walk_speed')
  .attr('welcome_complete');

/**
 * Expose `load`
 */

module.exports.load = function(ctx, next) {
  loadPlan(Plan, ctx, next);
};

/**
 * Sync plans with localStorage
 */

Plan.on('change', function(plan, name, val) {
  debug('plan.%s changed to %s', name, val);

  // Store in localStorage & track the change
  if (name !== 'options') plan.store();
});

/**
 * Keep start/end times in sync
 */

Plan.on('change start_time', function(plan, val, prev) {
  if (val >= plan.end_time()) plan.end_time(val + 1);
});

Plan.on('change end_time', function(plan, val, prev) {
  if (val <= plan.start_time()) plan.start_time(val - 1);
});

/**
 * Update routes. Restrict to once every 25ms.
 */

Plan.prototype.updateRoutes = debounce(function(opts, callback) {
  updateRoutes(this, opts, callback);
}, DEBOUNCE_UPDATES);

/**
 * Geocode
 */

Plan.prototype.geocode = function(dest, callback) {
  if (!callback) callback = function() {};

  var plan = this;
  var address = plan[dest]();
  var ll = plan[dest + '_ll']();
  if (address && address.length > 0) {
    geocode(address, function(err, ll) {
      if (err) {
        callback(err);
      } else {
        plan[dest + '_ll'](ll);
        callback(null, ll);
      }
    });
  } else {
    callback(null, ll);
  }
};

/**
 * Save Journey
 */

Plan.prototype.saveJourney = function(callback) {
  var opts = {};
  for (var key in this.attrs) {
    if (key === 'options' || key === 'journey' || key.indexOf('to') === 0 ||
      key.indexOf('from') === 0) {
      continue;
    }
    opts[key] = this.attrs[key];
  }

  // Create new journey
  var journey = new Journey({
    locations: [{
      _id: this.from_id()
    }, {
      _id: this.to_id()
    }],
    opts: opts
  });

  // Save
  journey.save(callback);
};

/**
 * Valid coordinates
 */

Plan.prototype.validCoordinates = function() {
  return this.fromIsValid() && this.toIsValid();
};

/**
 * Set Address
 */

Plan.prototype.setAddress = function(name, address, callback) {
  callback = callback || function() {}; // noop callback

  // Don't set if they're the same
  if (toLowerCase(this[name]()) === toLowerCase(address)) return callback();

  var plan = this;
  var location = new Location({
    address: address
  });

  location.save(function(err, res) {
    if (err) {
      callback(err);
    } else {
      var changes = {};
      changes[name] = address;
      changes[name + '_ll'] = res.body.coordinate;
      changes[name + '_id'] = res.body._id;
      changes[name + '_valid'] = true;

      plan.set(changes);
      callback(null, res.body);
    }
  });
};

/**
 * Set both addresses
 */

Plan.prototype.setAddresses = function(from, to, callback) {
  // Initialize the default locations
  var plan = this;

  Batch()
    .push(function(done) {
      plan.setAddress('from', from, done);
    })
    .push(function(done) {
      plan.setAddress('to', to, done);
    }).end(callback);
};

/**
 * Rescore Options
 */

Plan.prototype.rescoreOptions = function() {
  var scorer = this.scorer();
  var options = this.options();

  options.forEach(function(o) {
    o.rescore(scorer);
  });
};

/**
 * To Lower Case
 */

function toLowerCase(s) {
  return s ? s.toLowerCase() : '';
}

/**
 * From is valid
 */

Plan.prototype.fromIsValid = function() {
  var from = this.from_ll();
  return !!from && !!from.lat && !!from.lng;
};

/**
 * To is valid
 */

Plan.prototype.toIsValid = function() {
  var to = this.to_ll();
  return !!to && !!to.lat && !!to.lng;
};

/**
 * Modes as a CSV
 */

Plan.prototype.modesCSV = function() {
  var modes = [];
  if (this.bike()) modes.push('BICYCLE');
  if (this.bus()) modes.push('BUS');
  if (this.train()) modes.push('TRAINISH');
  if (this.walk()) modes.push('WALK');
  if (this.car()) modes.push('CAR');

  return modes.join(',');
};

/**
 * Store in localStorage. Restrict this I/O to once every 25ms.
 */

Plan.prototype.store = debounce(function() {
  store(this);
}, DEBOUNCE_UPDATES);

/**
 * Clear localStorage
 */

Plan.prototype.clearStore = store.clear;

/**
 * Save URL
 */

Plan.prototype.saveURL = function() {
  window.history.replaceState(null, '', '?from=' + this.from() + '&to=' + this.to());
};

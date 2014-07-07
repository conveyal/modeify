var analytics = require('analytics');
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
    routes: [],
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
  .attr('original_modes')
  .attr('patterns')
  .attr('routes')
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
 * Filters
 */

var filters = ['bike', 'bike_speed', 'bus', 'train', 'car', 'walk', 'days',
  'start_time', 'end_time', 'from_ll', 'to_ll', 'walk_speed'
];

/**
 * Sync plans with localStorage
 */

Plan.on('change', function(plan, name, val) {
  debug('plan.%s changed to %s', name, val);

  // if the type is a filter, trigger `updateRoutes`
  if (plan.welcome_complete()) {
    if (filters.indexOf(name) !== -1) {
      plan.updateRoutes();
    }
  } else if (plan.original_modes() && plan.from_valid() && plan.to_valid()) {
    plan.attrs.welcome_complete = true;
    plan.set({
      bike: true,
      bus: true,
      car: true,
      train: true,
      walk: true
    });
  }

  if (name === 'from' || name === 'to') {
    window.history.replaceState(null, '', '?from=' + plan.from() + '&to=' + plan.to());
  }

  // Store in localStorage & track the change
  if (name !== 'routes' && name !== 'patterns') {
    plan.store();
    analytics.track('plan.' + name + ' changed', val);
  }
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
}, 25);

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
    if (key === 'routes' || key === 'patterns' || key.indexOf('to') === 0 ||
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
  var batch = new Batch();
  var plan = this;
  batch.push(function(done) {
    plan.setAddress('from', from, done);
  });

  batch.push(function(done) {
    plan.setAddress('to', to, done);
  });

  batch.end(callback);
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
  var valid = !!from && !!from.lat && !!from.lng;
  this.from_valid(valid);
  return valid;
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
}, 25);

/**
 * Clear localStorage
 */

Plan.prototype.clearStore = store.clear;

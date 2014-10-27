var Batch = require('batch');
var debounce = require('debounce');
var geocode = require('geocode');
var Journey = require('journey');
var Location = require('location');
var log = require('log')('plan');
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
    bike: true,
    bus: true,
    car: true,
    days: 'M—F',
    end_time: 9,
    from: '',
    from_valid: false,
    loading: true,
    options: [],
    per_year: false,
    start_time: 7,
    to: '',
    to_valid: false,
    train: true,
    tripsPerYear: 235,
    walk: true
  }))
  .attr('bike')
  .attr('bus')
  .attr('car')
  .attr('days')
  .attr('end_time')
  .attr('from')
  .attr('from_id')
  .attr('from_ll')
  .attr('from_valid')
  .attr('loading')
  .attr('journey')
  .attr('options')
  .attr('per_day')
  .attr('per_year')
  .attr('scorer')
  .attr('start_time')
  .attr('to')
  .attr('to_id')
  .attr('to_ll')
  .attr('to_valid')
  .attr('train')
  .attr('tripsPerYear')
  .attr('walk');

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
  log('plan.%s changed to %s', name, val);

  // Store in localStorage & track the change
  if (name !== 'options' && name !== 'journey' && name !== 'loading') plan.store();
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
  var skipKeys = ['options', 'journey', 'scorer'];
  for (var key in this.attrs) {
    if (skipKeys.indexOf(key) !== -1 || key.indexOf('to') === 0 || key.indexOf('from') === 0) {
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

  this.store();
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
 * Set modes from string
 */

Plan.prototype.setModes = function(csv) {
  if (!csv || csv.length < 1) return;

  this.bike(csv.indexOf('BICYCLE') !== -1);
  this.bus(csv.indexOf('BUS') !== -1);
  this.train(csv.indexOf('TRAINISH') !== -1);
  this.car(csv.indexOf('CAR') !== -1);
};

/**
 * Generate Query Parameters for this plan
 */

Plan.prototype.generateQuery = function() {
  var from = this.from_ll();
  var to = this.to_ll();

  var startTime = this.start_time();
  var endTime = this.end_time();
  var scorer = this.scorer();

  // Convert the hours into strings
  startTime += ':00';
  endTime = endTime === 24 ? '23:59' : endTime + ':00';

  return {
    bikeSpeed: scorer.rates.bikeSpeed,
    from: {
      lat: from.lat,
      lon: from.lng,
      name: 'From'
    },
    to: {
      lat: to.lat,
      lon: to.lng,
      name: 'To'
    },
    startTime: startTime,
    endTime: endTime,
    date: this.nextDate(),
    modes: this.modesCSV(),
    walkSpeed: scorer.rates.walkSpeed
  };
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
  var url = '?';
  url += 'from=' + this.from();
  url += '&to=' + this.to();
  url += '&modes=' + this.modesCSV();
  url += '&start_time=' + this.start_time();
  url += '&end_time=' + this.end_time();
  url += '&days=' + this.days();

  window.history.replaceState(null, '', url);
};

/**
 * Get next date for day of the week
 */

Plan.prototype.nextDate = function() {
  var now = new Date();
  var date = now.getDate();
  var dayOfTheWeek = now.getDay();
  switch (this.days()) {
    case 'M—F':
      if (dayOfTheWeek === 0) now.setDate(date + 1);
      if (dayOfTheWeek === 6) now.setDate(date + 2);
      break;
    case 'Sat':
      now.setDate(date + (6 - dayOfTheWeek));
      break;
    case 'Sun':
      now.setDate(date + (7 - dayOfTheWeek));
      break;
  }
  return now.toISOString().split('T')[0];
};

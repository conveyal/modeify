/**
 * Dependencies
 */

var alerts = require('alerts');
var Batch = require('batch');
var Commuter = require('commuter');
var config = require('config');
var csvToArray = require('csv-to-array');
var debug = require('debug')(config.name() + ':organization-page');
var each = require('each');
var file = require('file');
var filePicker = require('file-picker');
var page = require('page');
var map = require('map');
var Organization = require('organization');
var request = require('request');
var spin = require('spinner');
var view = require('view');

/**
 * Create `View`
 */

var Row = view(require('./row.html'));
var View = view(require('./template.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  debug('render');

  ctx.organization.commuters = ctx.commuters;
  ctx.view = new View(ctx.organization);
  ctx.view.on('rendered', function() {
    var m = map(ctx.view.find('.map'), {
      center: ctx.organization.coordinate(),
      zoom: 13
    });
    m.addMarker(ctx.organization.mapMarker());

    var cluster = new L.MarkerClusterGroup();
    ctx.commuters.forEach(function(commuter) {
      cluster.addLayer(commuter.mapMarker());
    });

    m.addLayer(cluster);
    m.fitLayers([m.featureLayer, cluster]);
  });

  next();
};

/**
 * Commuter View
 */

View.prototype['commuters-view'] = function() {
  return Row;
};

/**
 * Commuters
 */

View.prototype.commuterCount = function() {
  return this.model.commuters.length();
};

/**
 * Destroy
 */

View.prototype.destroy = function(e) {
  if (window.confirm('Delete organization?')) {
    this.model.destroy(function(err) {
      if (err) {
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted organization.'
        });
        page('/manager/organizations');
      }
    });
  }
};

/**
 * Upload CSV
 */

View.prototype.uploadCSV = function(e) {
  var view = this;
  var spinner = spin();
  filePicker({
    accept: ['.csv']
  }, function(files) {
    var csv = file(files[0]);
    csv.toText(function(err, text) {
      var batch = new Batch();
      each(csvToArray(text), function(data) {
        if (!data.email || data.email.length < 5) {
          return alerts.show({
            type: 'danger',
            text: 'Each commuter must have an email address.'
          });
        }

        batch.push(function(done) {
          var commuter = new Commuter(data);
          commuter._user({
            email: data.email
          });
          commuter._organization(view.model._id());
          commuter.save(done);
        });
      });

      batch.end(function(err) {
        if (err) {
          window.alert('Error while uploading CSV. ' + err);
        } else {
          alerts.push({
            type: 'success',
            text: 'Upload succesful, commuters created.'
          });
        }
        spin.remove();
        page('/manager/organizations/' + view.model._id() + '/show');
      });
    });
  });
};

/**
 * Row labels
 */

Row.prototype.labels = function() {
  var l = this.model.labels();
  return l.map(function(label) {
    return '<span class="label label-default">' + label + '</span>';
  }).join(' ');
};

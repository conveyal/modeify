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
var go = require('go');
var map = require('map');
var Organization = require('organization');
var request = require('request');
var spin = require('spinner');
var view = require('view');

/**
 * Create `Page`
 */

var Page = view(require('./template.html'));
var Row = view(require('./row.html'));

/**
 * Expose `render`
 */

module.exports = function(ctx) {
  debug('render');
  if (ctx.params.organization === 'new' || !ctx.organization) return;

  ctx.organization.commuters = ctx.commuters;
  ctx.view = new Page(ctx.organization);
  ctx.view.on('rendered', function() {
    var m = map(ctx.view.find('.map'), {
      center: ctx.organization.coordinate(),
      zoom: 13
    });
    m.addMarker(ctx.organization.mapMarker());

    var cluster = new L.MarkerClusterGroup();
    var tbody = ctx.view.find('tbody');
    ctx.commuters.forEach(function(commuter) {
      var row = new Row(commuter);
      tbody.appendChild(row.el);
      row.marker = commuter.mapMarker();
      cluster.addLayer(row.marker);
    });

    m.addLayer(cluster);
    m.fitLayer(cluster);
  });
};

/**
 * Commuters
 */

Page.prototype.commuters = function() {
  return this.model.commuters.length();
};

/**
 * Destroy
 */

Page.prototype.destroy = function(e) {
  if (window.confirm('Delete organization?')) {
    var page = this;
    this.model.destroy(function(err) {
      if (err) {
        window.alert(err);
      } else {
        alerts.push({
          type: 'success',
          text: 'Deleted organization.'
        });
        go('/organizations');
      }
    });
  }
};

/**
 * Upload CSV
 */

Page.prototype.uploadCSV = function(e) {
  var page = this;
  var spinner = spin();
  filePicker({ accept: [ '.csv' ] }, function(files) {
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
          commuter._organization(page.model._id());
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
        go('/organizations/' + page.model._id());
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

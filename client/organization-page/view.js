var alerts = require('alerts');
var Batch = require('batch');
var config = require('config');
var Commuter = require('commuter');
var csvToArray = require('csv-to-array');
var debug = require('debug')(config.application() + ':organization-page:view');
var domify = require('domify');
var each = require('each');
var file = require('file');
var filePicker = require('file-picker');
var Organization = require('organization');
var page = require('page');
var request = require('request');
var spin = require('spinner');
var value = require('value');
var view = require('view');

/**
 * Expose `View`
 */

var View = module.exports = view({
  category: 'manager',
  template: require('./template.html'),
  title: 'Organization Page'
});

/**
 * On rendered
 */

View.on('rendered', function(view) {
  debug('REALLY??');
});

/**
 * Commuter View
 */

var CommuterRow = view(require('./commuter.html'));

/**
 * Commuter View
 */

View.prototype['commuters-view'] = function() {
  return CommuterRow;
};

/**
 * Row labels
 */

CommuterRow.prototype.labels = function() {
  var l = this.model.labels();
  return l.map(function(label) {
    return '<span class="label label-default">' + label + '</span>';
  }).join(' ');
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

View.prototype.parseCSV = function(e) {
  var view = this;
  var spinner = spin();
  filePicker({
    accept: ['.csv']
  }, function(files) {
    var csv = file(files[0]);
    csv.toText(function(err, text) {
      spinner.remove();
      var commuters = csvToArray(text);
      view.showConfirmUpload(commuters.filter(function(commuter) {
        return commuter.email && String(commuter.email).length >= 5;
      }));
    });
  });
};

/**
 * Modal, Input
 */

var Input = view(require('./commuter-confirm-input.html'));
var Modal = view(require('./commuter-confirm-modal.html'));

/**
 * Confirm Upload
 */

View.prototype.showConfirmUpload = function(commuters) {
  var modal = new Modal({
    commuters: commuters,
    organization: this.model
  });
  document.body.appendChild(modal.el);
};

/**
 * Inputs
 */

Modal.prototype['commuters-view'] = function() {
  return Input;
};

/**
 * Close
 */

Modal.prototype.close = function(e) {
  e.preventDefault();
  this.el.remove();
};

/**
 * Upload Commuters
 */

Modal.prototype.upload = function(e) {
  e.preventDefault();
  var batch = new Batch();
  var spinner = spin();
  var modal = this;

  each(modal.findAll('tr'), function(el) {
    // if confirm is unchecked, skip
    if (!value(el.querySelector('.confirm'))) return;

    // get the other data
    var data = {
      address: String(el.querySelector('.address').innerText),
      email: String(el.querySelector('.email').innerText).toLowerCase(),
      name: String(el.querySelector('.name').innerText)
    };

    batch.push(function(done) {
      var commuter = new Commuter(data);
      commuter._user(data);
      commuter._organization(modal.model.organization._id());
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
    spinner.remove();
    modal.el.remove();
  });
};

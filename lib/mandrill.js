var config = require('./config');
var hogan = require('hogan.js');
var juice = require('juice');
var Mandrill = require('mandrill-api/mandrill').Mandrill;

/**
 * Templates
 */

var templates = {};

/**
 * Create `client`
 */

var client = module.exports.client = new Mandrill(process.env.MANDRILL_API_KEY);

/**
 * Expose `send` & `info`
 */

module.exports.send = send;
module.exports.info = info;

/**
 * Send
 */

function send(options, callback, template) {
  if (process.env.NODE_ENV === 'test') {
    if (options.to.email && options.template) {
      return callback(null, {
        _id: '123',
        status: 'sent'
      });
    } else {
      return callback(new Error(
        'Must have email & template set to send an email.'));
    }
  }

  if (!template) {
    if (templates[options.template]) {
      return send(options, callback, templates[options.template]);
    } else {
      return juice(__dirname + '/../assets/email/' + options.template +
        '.html', function(err, data) {
          if (err) {
            return callback(err);
          } else {
            templates[options.template] = hogan.compile(data);
            return send(options, callback, templates[options.template]);
          }
        });
    }
  }

  client.messages.send({
    message: {
      html: template.render(options),
      subject: options.subject,
      to: [options.to],
      from_email: config.email.address,
      from_name: config.email.name,
      track_opens: true,
      track_clicks: true,
      auto_text: true,
      tags: options.tags || []
    }
  }, function(result) {
    if (result[0].status === 'rejected' || result[0].status === 'invalid') {
      callback(new Error(result[0].reject_reason), result[0]);
    } else {
      callback(null, result[0]);
    }
  }, function(err) {
    callback(err);
  });
}

/**
 * Info
 */

function info(id, callback) {
  client.messages.info({
    id: id
  }, function(results) {
    callback(null, results);
  }, function(err) {
    callback(err);
  });
}

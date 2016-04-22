import handlebars from 'handlebars'
import juice from 'juice'
import Sparkpost from 'sparkpost'

import config from './config'

const spark = new Sparkpost()
const templates = {}

export function send (options, callback, template) {
  if (process.env.NODE_ENV === 'test') {
    if (options.to.email && options.template) {
      return callback(null, {
        _id: '123',
        status: 'sent'
      })
    } else {
      return callback(new Error('Must have email & template set to send an email.'))
    }
  }

  if (!template) {
    if (templates[options.template]) {
      return send(options, callback, templates[options.template])
    } else {
      return juice.juiceFile(__dirname + '/../assets/email/' + options.template + '.html', {},
        function (err, data) {
          if (err) {
            return callback(err)
          } else {
            templates[options.template] = handlebars.compile(data)
            return send(options, callback, templates[options.template])
          }
        }
      )
    }
  }

  spark.transmissions.send({
    transmissionBody: {
      content: {
        from: { email: config.email.address, name: config.email.name },
        html: template(options),
        subject: options.subject
      },
      options: {
        click_tracking: true,
        open_tracking: true,
        transactional: true
      },
      recipients: [{address: options.to}]
    }
  }, (err, response) => {
    if (err) {
      callback(err)
    } else {
      callback(null, response.body)
    }
  })
}

export function info (id, callback) {
  spark.transmissions.get(id, (err, response) => {
    if (err) {
      callback(err)
    } else {
      callback(null, response.body)
    }
  })
}

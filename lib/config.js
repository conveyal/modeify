const toSlugCase = require('to-slug-case')

const env = process.env.NODE_ENV || 'development'
const config = module.exports = {env}
let json = {
  application: '',
  environments: {}
}
if (process.env.MODEIFY_CONFIG) {
  json = JSON.parse(new Buffer(process.env.MODEIFY_CONFIG, 'base64').toString())
}

for (const key in json) {
  config[key] = json[key]
}

// Override defaults with environment specific values

for (const key in json.environments[env]) {
  config[key] = json.environments[env][key] || json[key] || ''
}

// Delete environments

delete config.environments

// Store environment variables in the config object

for (const key in process.env) {
  config[key] = process.env[key]
  config[key.toLowerCase()] = process.env[key]
}

// Set specific config values

const slug = toSlugCase(config.application)
config.secretKey = new Buffer(`${slug}.${config.env}.${process.env.SECRET_KEY || process.env.COOKIE_SECRET}`).toString('base64')

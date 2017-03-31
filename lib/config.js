const loadConfig = require('mastarm/lib/load-config')
const toSlugCase = require('to-slug-case')
const YAML = require('yamljs')

const env = process.env.NODE_ENV || 'development'
const config = module.exports = {env}
let json = {
  application: ''
}

config._defaultConfig = env === 'development'
  ? loadConfig(process.cwd(), process.argv[2], 'development')
  : {}

if (process.env.MODEIFY_CONFIG) {
  json = YAML.parse(new Buffer(process.env.MODEIFY_CONFIG, 'base64').toString())

  if (json.environments && json.environments[env]) {
    json = Object.assign({}, json, json.environments[env])
    delete json.environments
  }

  config._defaultConfig.settings = Object.assign({}, json)
} else {
  process.env = Object.assign({}, process.env, config._defaultConfig.env)
  json = Object.assign({}, config._defaultConfig.settings)
}

for (const key in json) {
  config[key] = json[key]
}

// Store environment variables in the config object

for (const key in process.env) {
  config[key] = process.env[key]
  config[key.toLowerCase()] = process.env[key]
}

// Set specific config values

const slug = toSlugCase(config.application)
config.secretKey = new Buffer(`${slug}.${config.env}.${process.env.SECRET_KEY || process.env.COOKIE_SECRET}`).toString('base64')

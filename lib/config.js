const toSlugCase = require('to-slug-case')
const YAML = require('yamljs')

const env = process.env.NODE_ENV || 'development'
const config = module.exports = {env}
let json = {
  application: ''
}

if (process.env.MODEIFY_CONFIG) {
  json = YAML.parse(new Buffer(process.env.MODEIFY_CONFIG, 'base64').toString())
} else { // local development
  const argv = require('minimist')(process.argv.slice(2))
  const loadConfig = require('mastarm/lib/load-config')
  const baseConfig = config.rawConfig = loadConfig(process.cwd(), argv.config, 'development')
  // override environment
  process.env = Object.assign({}, process.env, baseConfig.env)
  json = baseConfig.settings
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

import fs from 'fs'
import {load as yml2json} from 'js-yaml'
import toSlugCase from 'to-slug-case'

const env = process.env.NODE_ENV || 'development'
const config = { env }
const file = env === 'test' ? 'config/config.yaml.tmp' : 'deployment/config.yaml'
const path = `${__dirname}/../${file}`
const json = fs.existsSync(path) ? yml2json(fs.readFileSync(path, 'utf8')) : JSON.parse(process.env.MODEIFY_CONFIG)

for (let key in json)
  config[key] = json[key]

  // Override defaults with environment specific values

for (let key in json.environments[env])
  config[key] = json.environments[env][key] || json[key] || ''

  // Delete environments

delete config.environments

// Store environment variables in the config object

for (let key in process.env) {
  config[key] = process.env[key]
  config[key.toLowerCase()] = process.env[key]
}

// Set specific config values

const slug = toSlugCase(config.application)

config.cookieKey = `${slug}.${config.env}`
config.cookieSecret = new Buffer(`${process.env.COOKIE_SECRET}.${config.cookieKey}`).toString('base64')

// Expose the configuration values

export default config

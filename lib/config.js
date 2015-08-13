import fs from 'fs'
import {load as yml2json} from 'js-yaml'
import toSlugCase from 'to-slug-case'

const env = process.env.NODE_ENV || 'development'
const config = { env }
const path = env === 'test' ? 'config/config.yaml.tmp' : 'deployment/config.yaml'
const yaml = yml2json(fs.readFileSync(`${__dirname}/../${path}`, 'utf8'))

for (let key in yaml)
  config[key] = yaml[key]

  // Override defaults with environment specific values

for (let key in yaml.environments[env])
  config[key] = yaml.environments[env][key] || yaml[key] || ''

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

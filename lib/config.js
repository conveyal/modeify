import fs from 'fs'
import {load as yml2json} from 'js-yaml'

const env = process.env.NODE_ENV || 'development'
const config = {}
const path = env === 'test' ? 'config/config.yaml.tmp' : 'deployment/config.yaml'
const yaml = yml2json(fs.readFileSync(__dirname + '/../' + path, 'utf8'))

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

// Expose the configuration values

export default config

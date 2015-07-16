import concat from 'concat-stream'
import http from 'http'

import { otp } from '../config'
import log from '../log'

export default request

function request (url) {
  return new Promise((resolve, reject) => {
    const options = {
      host: otp.host,
      method: 'GET',
      path: otp.path + url,
      port: otp.port
    }

    const creq = http.request(options, (cres) => {
      cres.setEncoding('utf8')
      cres.pipe(concat((data) => {
        if (cres.statusCode !== 200) {
          log.error('otp:error', {
            message: data,
            statusCode: cres.statusCode,
            url: otp.path + url
          })
          reject(data)
        } else {
          try {
            JSON.parse(data)
          } catch (e) {
            log.error('otp:parseerror', data)
            data = {
              id: data,
              options: [],
              routeId: '',
              stops: [],
              error: e
            }
            reject(data)
          }
          resolve(data)
        }
      }))
    }).on('error', reject)
    creq.end()
  })
}

const { isObject } = require('lodash')
const redis = require('redis')

class Redis {
  constructor () {
    this.host = 'p5368c8903ce7ee8c9359415d00b089ff52e7b010d88287ae615e2707b10c38be@ec2-52-202-172-13.compute-1.amazonaws.com'
    this.port = '20419'
    this.TTL = 3600
    this.client = redis.createClient({ host: this.host, port: this.port, prefix: `WEATHER` })
  }

  set (key, value) {
    if (isObject(value)) value = JSON.stringify(value)
    this.client.set(key, value, 'EX', this.TTL)
  }

  get (key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, resp) => {
        if (err) return reject(err)
        return resolve(JSON.parse(resp))
      })
    })
  }

  hset (hash, field, value, isError = false) {
    return new Promise((resolve, reject) => {
      if (isObject(value)) value = JSON.stringify(value)
      this.client.hset(hash, field, value, (err, resp) => {
        if (err) return reject(err)
        if (!isError) this.client.expire(hash, 3200)
        console.log('redis done', hash, field)
        return resolve(JSON.parse(resp))
      })
    })
  }

  hget (hash, field) {
    return new Promise((resolve, reject) => {
      this.client.hget(hash, field, (err, resp) => {
        if (err) return reject(err)
        return resolve(resp)
      })
    })
  }

  hgetall (hash) {
    return new Promise((resolve, reject) => {
      this.client.hgetall(hash, (err, resp) => {
        if (err) return reject(err)
        return resolve(resp)
      })
    })
  }
}

module.exports = new Redis()

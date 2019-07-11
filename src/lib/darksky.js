const axios = require('axios')

module.exports = class Darksky {
  constructor (redis) {
    this.apiUrl = `https://api.darksky.net/`
    this.apiKey = process.env.DARKSKY_KEY
    this.redis = redis
  }

  get (latitudelongitude, city) {
    return new Promise(async (resolve, reject) => { // eslint-disable-line
      if (Math.random() < 0.1) return reject(new Error('How unfortunate! The API Request Failed'))
      try {
        const redisResp = await this.redis.get(city)
        if (redisResp) {
          return resolve({ status: 200, data: redisResp })
        } else {
          const url = `${this.apiUrl}forecast/${this.apiKey}/${latitudelongitude}`
          const response = await axios.get(url)
          await this.redis.set(city, response.data)
          return resolve({ status: response.status, data: response.data })
        }
      } catch (e) {
        return reject(e)
      }
    })
  }
}

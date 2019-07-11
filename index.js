const express = require('express')
const { forEach, get } = require('lodash')
const applicationConfig = require('./src/config/application')

const moment = require('moment')
const tz = require('moment-timezone')
const DarkSky = require('./src/lib/darksky')

const app = express()
const http = require('http').createServer(app);
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

process.env.REDIS_PORT = '6379'
if (process.env.NODE_ENV === 'production') {
  process.env.REDIS_HOST = 'redis-weather-001.i2yo44.0001.use1.cache.amazonaws.com'
} else {
  process.env.REDIS_HOST = '127.0.0.1'
}

const redis = require('./src/lib/redis')

applicationConfig(app)

const io = require('socket.io')(http)

const cities = [
  { name: 'Santiago', coord: '-33.440803,-70.641114' },
  { name: 'Zurich', coord: '47.392872,8.533658' },
  { name: 'Auckland', coord: '-36.854562,174.779958' },
  { name: 'Sidney', coord: '-33.871413,151.208956' },
  { name: 'Londres', coord: '51.507338,-0.127546' },
  { name: 'Georgia', coord: '32.579666,-83.234395' }
]
let promises = []

const getRecursive = async(coords, city) => {
  const darkInstance = new DarkSky(redis)
  return new Promise(async (resolve, reject) => {
    try {
      const { data: weatherInfo } = await darkInstance.get(coords, city)
      return resolve(weatherInfo)
    } catch (error) {
      console.log('DEBUG: getRecursive -> error', error)
      if (error.message === 'How unfortunate! The API Request Failed') {
        await redis.hset('api.errors', moment().unix(), error.message, true)
        const resp = await getRecursive(coords, city)
        return resp
      } else {
        return reject(error)
      }
    }
  })
}

const getWeatherInfo = async (cities, socket) => {
  try {
    forEach(cities, async (value, key) => {
      const weatherInfo = await getRecursive(value, key)
      let infoToSend = {}
      infoToSend[key] = {
        datetime: moment().tz(weatherInfo.timezone).format(),
        temperature: get(weatherInfo, 'currently.temperature')
      }
      console.log('DEBUG: getWeatherInfo -> weatherInfo', infoToSend)
      socket.broadcast.emit('WEATHER', infoToSend);
    })
    return(0)
  } catch (error) {
    console.error('DEBUG: getWeatherInfo -> error', error)
  }
}

forEach(cities, (city) => {
  promises.push(redis.hset('CITIES', city.name, city.coord))
})

Promise.all(promises).then(async (resp) => {
  try {
    const citiesInfo = await redis.hgetall('CITIES')
    io.on('connection', function(socket){
      console.log('a user connected');
      setInterval(() => {
        getWeatherInfo(citiesInfo, socket)
      }, 10000);
    })
    app.get('/', function(req, res){
      res.sendFile(__dirname + '/index.html');
    });
    
    http.listen(port, host, err => {
      if (err) { process.exit(err) }
      console.log(`
        Listening at PORT: ${host}:${port}
    
        @org: Andres Juarez
        @date: ${moment().format()}
        @address: Santiago, Chile.
        @enviroment: ${process.env.NODE_ENV}
      `)
    })
  } catch (error) {
    
  }
})


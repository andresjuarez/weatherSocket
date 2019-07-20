const bodyParser = require('body-parser')

module.exports = (app) => {
  const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
      res.send(200)
    } else {
      next()
    }
  }
  const logRequestStart = (req, res, next) => {
    console.info(`${req.method} ${req.originalUrl}`)
    res.on('finish', () => {
      console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
    })
    next()
  }
  app.user(allowCrossDomain)
  app.use(logRequestStart)
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
}

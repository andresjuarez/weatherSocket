const bodyParser = require('body-parser')

module.exports = (app) => {
  const logRequestStart = (req, res, next) => {
    console.info(`${req.method} ${req.originalUrl}`)
    res.on('finish', () => {
      console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
    })
    next()
  }
  app.use(logRequestStart)
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
}

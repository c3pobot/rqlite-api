'use strict'
const log = require('logger')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000
const app = express()

const rqlite = require('./rqlite')
const client = require('rqlite-client')

app.use(bodyParser.json({
  limit: '1000MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression())
app.get('/get/*', (req, res)=>{
  // /get/table/id/value
  rqlite.get(req, res)
})
app.post('/set', (req, res)=>{
  rqlite.set(req, res)
})
const server = app.listen(PORT, ()=>{
  log.info(`rqlite-api is listening on ${server.address().port}`)
})

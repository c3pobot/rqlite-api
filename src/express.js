'use strict'
const log = require('logger')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000
const app = express()

const rqlite = require('./rqlite')

app.use(bodyParser.json({
  limit: '1000MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression())
app.get('/get/*', (req, res)=>{
  // /get/table/id/value
  handleGet(req, res)
})
app.post('/set', (req, res)=>{
  handleSet(req, res)
})
const server = app.listen(PORT, ()=>{
  log.info(`rqlite-api is listening on ${server.address().port}`)
})
const handleSet = async(req, res)=>{
  try{
    if(!req.body){
      res.sendStatus(400)
      return
    }
    let result = await rqlite.set(req.body.cache || req.body.table, req.body.key, req.body.altKey, req.body.data, req.body.ttl, req.body.noTTL)
    if(result){
      res.sendStatus(200)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
const handleGet = async(req, res)=>{
  try{
    let args = req?.path?.replace('/get/', '')?.split('/')
    if(args.length !== 3){
      res.sendStatus(400)
      return
    }
    let data = await rqlite.get(args[0], args[1], args[2])
    if(data){
      res.json(data)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}

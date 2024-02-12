'use strict'
const rqlite = require('rqlite-client')
const tables = require('./tables.json')
const log = require('logger')
const client = new rqlite({ host: process.env.RQLITE_HOST })
const init = async()=>{
  try{
    let count = 0, created = 0
    for(let i in tables){
      count++
      let exists = await client.checkTableExists(tables[i].name)
      if(exists){
        created++
      }else{
        let results = await client.createTable(tables[i].build)
        if(results) created++
      }
    }
    if(count && count === created) return true
  }catch(e){
    throw(e)
  }
}
module.exports.init = init
module.exports.get = async(req, res)=>{
  try{
    let args = req?.path?.replace('/get/', '')?.split('/')
    let ttl = true
    if(req.get('noTTL')) ttl = false
    if(args.length !== 3){
      res.sendStatus(400)
      return
    }
    if(!tables[args[0]]){
      res.sendStatus(400)
      return
    }
    let data = await client.get(args[0], args[1], args[2], ttl)
    if(data){
      if(tables[args[0]].json) res.setHeader('Content-Type', 'application/json')
      res.send(data)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
}
module.exports.set = async(req, res)=>{
  try{
    if(!req.body){
      res.sendStatus(400)
      return
    }
    console.log('has body')
    let ttl = req.body?.ttl, table = req.body.cache || req.body.table, data = req.body.data
    if(!tables[table]){
      res.sendStatus(400)
      return
    }
    console.log('has table')
    if(!ttl && !req.body?.noTTL) ttl = tables[table].ttl
    if(tables[table].json) data = JSON.stringify(data)
    let result = await client.setJSON(table, req.body.key, req.body.altKey, req.body.data, ttl)
    console.log(result)
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

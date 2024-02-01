'use strict'
const { DataApiClient } = require('rqlite-js');
const RQLITE_HOST = process.env.RQLITE_HOST || 'http://rqlite-svc-internal:4001'

const client = new DataApiClient(RQLITE_HOST);
const tables = require('./tables.json')

const getError = (results)=>{
  try{
    let error = results?.getFirstError()
    if(error) return JSON.parse(error?.toString())?.error
  }catch(e){
    throw(e)
  }
}
const checkTableExists = async(tableName)=>{
  try{
    let result = await client.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`)
    if(!result) return
    if(result?.hasError()){
      let error = getError(result)
      if(error?.startsWith(`table ${tableName} already exists`)) return true
      return
    }
    if(result?.get(0)?.data?.name === tableName) return true
  }catch(e){
    throw(e)
  }
}
const createTable = async(sql)=>{
  try{
    let result = await client.execute(sql)
    if(result?.get(0)?.rowsAffected) return true
  }catch(e){
    throw(e)
  }
}
const init = async()=>{
  try{
    let count = 0, created = 0
    for(let i in tables){
      count++
      let exists = await checkTableExists(tables[i].name)
      if(exists){
        created++
      }else{
        let results = await createTable(tables[i].build)
        if(results) created++
      }
    }
    if(count && count === created) return true
  }catch(e){
    throw(e)
  }
}
const set = async(table, value, altValue, data, expireSeconds, noTTL = false)=>{
  try{
    if(!table || !value || !data) return
    if(!tables[table]) return
    let ttl, string = data, expireTime = expireSeconds || tables[table]?.ttl
    if(expireTime && !noTTL) ttl = Date.now() + expireTime * 1000
    if(tables[table]?.json) string = JSON.stringify(string)
    let sql = `INSERT OR REPLACE INTO ${table} VALUES('${value}', '${altValue}', '${string}', ${ttl})`
    let results = await client.execute(sql)
    return results?.get(0)?.rowsAffected
  }catch(e){
    throw(e)
  }
}

const get = async(table, key, value)=>{
  try{
    if(!table || !key || !value) return
    if(!tables[table]) return
    let sql = `SELECT * FROM ${table} WHERE ${key} = '${value}'`
    let results = await client.query(sql)
    let data = results.get(0)?.data?.data
    if(data){
      if(tables[table]) return JSON.parse(data)
      return data
    }
  }catch(e){
    throw(e)
  }
}
module.exports.init = init
module.exports.set = set
module.exports.get = get

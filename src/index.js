'use strict'
const log = require('logger')
const rqlite = require('./rqlite')
const InitDB = async()=>{
  try{
    let status = await rqlite.init()
    if(status){
      require('./express')
      return
    }else{
      setTimeout(InitDB, 5000)
    }
  }catch(e){
    console.log(e)
    log.error(e)
    setTimeout(InitDB, 5000)
  }
}
InitDB()

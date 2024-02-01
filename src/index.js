'use strict'
const log = require('logger')
const rqlite = require('./rqlite')
const init = async()=>{
  try{
    let status = await rqlite.init()
    if(status){
      require('./express')
      return
    }else{
      setTimeout(init, 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(init, 5000)
  }
}
init()

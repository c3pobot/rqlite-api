'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
process.on('unhandledRejection', (error) => {
  console.error(error)
});
require('./src')

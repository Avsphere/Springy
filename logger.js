const env = process.env.NODE_ENV || 'dev'
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file')
const fs = require('fs')
const path = require('path')

const LOGDIR = './logs'

if (!fs.existsSync(LOGDIR)) { fs.mkdirSync(LOGDIR); }

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${LOGDIR}/%DATE%-logs.log`,
  datePattern: 'YYYY-MM-DD'
})



const loggerTransports = [
  new transports.Console({
    level : 'silly',
    format : format.combine(
      format.colorize(),
      format.printf( info => `${info.timestamp} ${info.level}: ${info.message}` )
    )
  })
]

if ( env !== 'dev' ) { loggerTransports.push( dailyRotateFileTransport) }

//levels : { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
const logger = createLogger({
  level: env === 'dev' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format : 'YYYY-MM-DD HH:mm:ss'
    }),
    format.splat(),
    format.json()
  ),
  transports: loggerTransports
});

module.exports = logger;

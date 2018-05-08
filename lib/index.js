const {createLogger, format, transports} = require('winston')
const {timestamp, label, printf} = format
const DailyRotateFile = require('winston-daily-rotate-file')

const fs = require('fs')
const path = require('path')

const pid = process.pid
const pname = path.basename(process.cwd())
const os = require('os')

const errorFormat = format((info, opts) => {
  if (info instanceof Error) {
    info.message = info.stack
  }
  if (info.error && info.error instanceof Error) {
    info.message += os.EOL + info.error.stack
  }
  return info
})

let _createLogger = () => {}

if (fs.existsSync(path.join(process.cwd(), 'laputa-log-conf.js'))) {
  // cwd下的logger
  const {createLogger: cwdCreateLogger} = require(path.join(process.cwd(), 'laputa-log-conf.js'))
  _createLogger = () => {
    return cwdCreateLogger()
  }
} else {
  // 默认的logger
  const logger = createLogger({
    level: 'info',
    format: format.combine(errorFormat(), format.timestamp(), format.printf((info) => {
      return `[${info.timestamp}] [${info.level}] - ${info.message}`
    })),
    transports: [
      new transports.Console(),
      new DailyRotateFile({
        level: 'error',
        filename: `./logs/${pname}-${pid}-error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '14d'
      }),
      new DailyRotateFile({filename: `./logs/${pname}-${pid}-out-%DATE%.log`, datePattern: 'YYYY-MM-DD', zippedArchive: true, maxSize: '100m', maxFiles: '14d'})
    ]
  })

  _createLogger = () => {
    return logger
  }
}

module.exports = {
  createLogger: _createLogger
}

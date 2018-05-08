const {createLogger, format, transports} = require('winston')
const {timestamp, label, printf} = format
const DailyRotateFile = require('winston-daily-rotate-file')

const fs = require('fs')
const path = require('path')

const pid = process.pid
const pname = path.basename(process.cwd())

const errorFormat = format((info, opts) => {
  if (info instanceof Error) {
    info.message = info.stack
  }
  return info
})

module.exports = {
  createLogger: () => {
    return createLogger({
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
  }
}

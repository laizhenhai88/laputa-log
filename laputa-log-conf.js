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
                    filename: `../logs/${pname}/error.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: false,
                    maxSize: '1000m',
                    maxFiles: '3d'
                }),
                new DailyRotateFile({
                    filename: `../logs/${pname}/service.%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: false,
                    maxSize: '1000m',
                    maxFiles: '3d'
                })
            ]
        })
    }
}

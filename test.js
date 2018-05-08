const logger = require('./lib/index').createLogger()

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
}

for (let level in levels) {
  logger[level](`this is level ${level} - ${levels[level]}`)
}

logger.error(new Error('heap out'))
logger.error('load db failed', {error: new Error('heap out')})

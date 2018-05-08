# laputa-log

* 选择winston做封装
* 传送门 https://github.com/winstonjs/winston/
* 使用上希望不考虑配置，比如直接const logger = require('laputa-log')
* 或者import logger from 'laputa-log'
* 再或者const logger = require('laputa-log').createLogger()也可以接受
* 总之，不要在逻辑代码使用logger的时候，还去考虑logger的配置问题
* 那么问题是，配置该在哪里做
* 最好是cwd下有一个json配置文件laputa-log.json
* 考虑到js配置文件也很方便，并且更强大，可以接受laputa-log-conf.js
* 所以require('laputa-log')执行的时候，就会去cwd找配置文件
* 为什么是cwd，主要是希望node-modules里的模块不要有独立的logger配置
* 1、所有逻辑代码使用的logger都统一用一个默认配置
* 2、有及其特殊的情况时，可以考虑createLogger('mySpecialCategories')来获取特殊的logger
* 3、如果categories不存在则使用默认配置
* 第一版的目标：
* createLogger()的方式创建logger
* laputa-log能读取cwd的配置
* log的format简单点也行
* log的文件名必须区分出哪个项目，哪个进程id
* error级别的log单独出一个文件

### 安装
```shell
# npm install laputa-log
```

### 使用
```js
const logger = require('laputa-log').createLogger()

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
```

### 默认配置
```js
{
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
}
```
pname : 项目名称

pid : 进程id

### log输出如下
```shell
[2018-05-08T09:28:19.282Z] [error] - this is level error - 0
[2018-05-08T09:28:19.286Z] [warn] - this is level warn - 1
[2018-05-08T09:28:19.286Z] [info] - this is level info - 2
[2018-05-08T09:28:19.287Z] [error] - Error: heap out
    at Object.<anonymous> (/project/laputa-log/test.js:16:14)
    at Module._compile (module.js:635:30)
    at Object.Module._extensions..js (module.js:646:10)
    at Module.load (module.js:554:32)
    at tryModuleLoad (module.js:497:12)
    at Function.Module._load (module.js:489:3)
    at Function.Module.runMain (module.js:676:10)
    at startup (bootstrap_node.js:187:16)
    at bootstrap_node.js:608:3
```

### 自定义输出
在项目的当前工作目录(process.cwd)新建laputa-log-conf.js文件并配置自定义createLogger
```js
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
```

### 测试当前项目
```shell
# node test.js
```

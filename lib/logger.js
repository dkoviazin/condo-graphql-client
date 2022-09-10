const pino = require('pino')

class Logger {

    logger

    constructor(name, level = 'error') {
        this.logger = pino({
            name,
            level,
        })
    }

    print(type, msg, payload) {
        this.logger[type]({
            msg,
            payload,
        })
    }

    info (message, data) {
        this.print('info', message, data)
    }

    error (message, data) {
        this.print('error', message, data)
    }

    debug (message, data) {
        this.print('debug', message, data)
    }

}

module.exports = {
    Logger,
}
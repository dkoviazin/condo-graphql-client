const LEVELS = {
    'error': 10,
    'info': 20,
    'debug': 30,
}

class Logger {

    // TODO: switch to pino
    level

    constructor(name, level = 'error') {
        this.name = name
        this.level = LEVELS[level] || 0
    }

    print(type, msg, payload) {
        if (this.level <= LEVELS[type]) {
            console.log(this.name, msg, payload)
        }
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
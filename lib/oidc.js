const fetch = require('cross-fetch')

class OIDCAuthClient {

    constructor (authToken) {
        this.authToken = authToken
        this.cookieJar = new fetch.Headers()
    }

    async oidcRequest (url) {
        const response = await fetch(url, {
            headers: {
                ...this.authToken ? { authorization: `Bearer ${this.authToken}` } : {},
                cookie: [...this.cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join('; '),
            },
            redirect: 'manual',
            credentials: 'same-origin',
        })
        if (response.status >= 400) {
            throw new Error(`OIDC request failed: ${response.status} ${response.statusText}`)
        }
        const newCookies = response.headers.raw()['set-cookie']
        if (newCookies) {
            newCookies.forEach(cookie => {
                const [cookieValue] = cookie.split(';')
                const [name, value] = cookieValue.split('=')
                this.cookieJar.set(name, value)
            })
        }
        return {
            location: response.headers.get('location'),
            debug: await response.text(),
        }
    }

}

module.exports = {
    OIDCAuthClient,
}
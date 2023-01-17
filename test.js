require('dotenv').config()
const { UserClient } = require('./index')

const { endpoint, authRequisites = {} } = process.env.INTEGRATION ? JSON.parse(process.env.INTEGRATION) : {}

const bootstrap = async () => {
    const bot = new UserClient(endpoint, authRequisites)
    const currentUser = await bot.signIn()
    console.log('Logged in as ', currentUser)
}

bootstrap().then(() => {
    process.exit(0)
}).catch(error => {
    console.error(error)
    process.exit(1)
})




require('dotenv').config()
const { UserClient } = require('./index')

const { endpoint, authRequisites = {} } = process.env.INTEGRATION ? JSON.parse(process.env.INTEGRATION) : {}

const bootstrap = async () => {


    const REGISTRY_URL = 'https://registry.d.doma.ai'
    const CONDO_URL = 'https://condo.d.doma.ai'

    const client = new UserClient(`${CONDO_URL}/admin/api`, { phone:'***', password: '***' })
    await client.signIn()

    const miniApp = await client.signInToMiniApp(`${REGISTRY_URL}/graphql`)
    console.log(await miniApp.currentUser())
}

bootstrap().then(() => {
    process.exit(0)
}).catch(error => {
    console.error(error)
    process.exit(1)
})




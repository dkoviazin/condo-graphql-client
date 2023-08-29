const { CondoBot } = require('./condo')

const {
    SIGNIN_BY_EMAIL_MUTATION,
    SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION_WITH_TOKEN,
    User: UserGql,
} = require('../lib/gql')
const { OIDCAuthClient } = require('../lib/oidc')

class UserClient extends CondoBot {

    userId

    async signIn () {
        if (Reflect.has(this.authRequisites, 'phone')) {
            await this.singInByPhoneAndPassword()
        } else {
            await this.singInByEmailAndPassword()
        }
        return await this.currentUser()
    }

    async singInByEmailAndPassword () {
        const { email,  password } = this.authRequisites
        const { data: { auth: { user, token } } } = await this.client.mutate({
            mutation: SIGNIN_BY_EMAIL_MUTATION,
            variables: { identity: email, secret: password },
        })
        this.userId = user.id
        this.authToken = token
    }

    async singInByPhoneAndPassword () {
        const { phone, password } = this.authRequisites
        const { data: { obj: { item: user, token } } } = await this.client.mutate({
            mutation: SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION_WITH_TOKEN,
            variables: { ...this.dvSender(), phone, password },
        })
        this.userId = user.id
        this.authToken = token
    }

    /**
     * @example
     * const client = new ApolloServerClient(`${CONDO_URL}/admin/api`, { phone:'***', password: '***' })
     * await client.signIn()
     * const miniAppClient = await client.signInToMiniApp(`${REGISTRY_URL}/graphql`)
     */
    async signInToMiniApp (apiEndpoint) {
        if (!this.authToken) {
            throw new Error('You need to authorize on condo first')
        }
        const miniAppAuth = new OIDCAuthClient()
        const condoAuth = new OIDCAuthClient(this.authToken)
        const { origin } = new URL(apiEndpoint)
        // Start auth
        const { location: startAuthUrl } = await miniAppAuth.oidcRequest(`${origin}/oidc/auth`)
        // Condo redirects
        const { location: interactUrl } = await condoAuth.oidcRequest(startAuthUrl)
        const { location: interactCompleteUrl } = await condoAuth.oidcRequest(interactUrl)
        const { location: completeAuthUrl } = await condoAuth.oidcRequest(interactCompleteUrl)
        // Complete auth
        await miniAppAuth.oidcRequest(completeAuthUrl)
        const decodedToken = decodeURIComponent(miniAppAuth.cookieJar.get('keystone.sid'))

        const miniAppClient = new UserClient(apiEndpoint, this.authRequisites)
        miniAppClient.authToken = decodedToken.split('s:')[1]
        miniAppClient.userId = this.userId
        return miniAppClient
    }

    async currentUser () {
        const [user] = await this.getModels({
            modelGql: UserGql,
            where: { id: this.userId },
        })
        return user
    }

}

module.exports = {
    UserClient,
}

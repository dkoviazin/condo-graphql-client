const { CondoBot } = require('./condo')

const {
    SIGNIN_BY_EMAIL_MUTATION,
    SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION_WITH_TOKEN,
    User: UserGql,
} = require('../lib/gql')

class UserBot extends CondoBot {

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
        const { identity,  password: secret } = this.authRequisites
        const { data: { auth: { user, token } } } = await this.client.mutate({
            mutation: SIGNIN_BY_EMAIL_MUTATION,
            variables: { identity, secret },
        })
        this.userId = user.id
        this.authToken = token
    }

    async singInByPhoneAndPassword () {
        const { phone,  password } = this.authRequisites
        const { data: { obj: { item: user, token } } } = await this.client.mutate({
            mutation: SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION_WITH_TOKEN,
            variables: { ...this.dvSender(), phone, password },
        })
        this.userId = user.id
        this.authToken = token
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
    UserBot,
}

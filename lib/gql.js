const { gql } = require('graphql-tag')
const { generateGqlQueries } = require('./gql-generate')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } createdBy { id name } updatedBy { id name } createdAt updatedAt'
const USER_FIELDS = `{ type name ${COMMON_FIELDS} }`

const SIGNIN_BY_EMAIL_MUTATION = gql`
    mutation signin($identity: String, $secret: String) {
        auth: authenticateUserWithPassword(email: $identity, password: $secret) {
            user: item {
                id
            }
            token
        }
    }
`

const SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION_WITH_TOKEN = gql`
    mutation authenticateUserWithPhoneAndPassword ($phone: String!, $password: String!) {
        obj: authenticateUserWithPhoneAndPassword(data: { phone: $phone, password: $password }) {
            item {
                id
            }
            token
        }
    }
`

const User = generateGqlQueries('User', USER_FIELDS)

module.exports = {
    SIGNIN_BY_EMAIL_MUTATION,
    SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION_WITH_TOKEN,
    User,
}
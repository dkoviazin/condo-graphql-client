
const { UserClient } = require('./client/userClient')
const { generateGqlQueries } = require('./lib/gql-generate.js')

module.exports = {
    generateGqlQueries,
    UserClient,
}


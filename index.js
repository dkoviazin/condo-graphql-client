
const { UserClient } = require('./bot/userClient')
const { generateGqlQueries } = require('./lib/gql-generate.js')

module.exports = {
    generateGqlQueries,
    UserClient,
}


const { ApolloClient, InMemoryCache, ApolloLink } = require('@apollo/client')
const { BatchHttpLink } = require('@apollo/client/link/batch-http')
const { createUploadLink } = require('apollo-upload-client')
const { onError }  = require('apollo-link-error')
const fetch = require('cross-fetch/polyfill').fetch
const { Logger } = require('../lib/logger')

const { MAX_REQUESTS_IN_BATCH } = require('../constants')

const logger = new Logger()

class CondoBot {

    client
    authToken
    clientName = 'ticket-demo-bot'
    locale = 'ru'
    endpoint
    authRequisites = {}

    dvSender () {
        return {
            dv: 1,
            sender: {
                dv: 1,
                fingerprint: this.clientName,
            },
        }
    }

    constructor (endpoint, authRequisites = {}) {
        this.endpoint = endpoint
        this.authRequisites = authRequisites
        this.batchClient = this.createClient([this.errorLink(), this.authLink(), this.batchTerminateLink()])
        this.client = this.createClient([this.errorLink(), this.authLink(), this.uploadTerminateLink()])
    }

    createClient (links) {
        return new ApolloClient({
            link: ApolloLink.from(links),
            cache: new InMemoryCache({ addTypename: false }),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'no-cache',
                },
                query: {
                    fetchPolicy: 'no-cache',
                },
            },
        })
    }

    async loadByChunks ({ modelGql, where, chunkSize = 100, limit = 100000, sortBy = ['id_ASC'] }) {
        let skip = 0
        let maxIterationsCount = Math.ceil(limit / chunkSize)
        let newChunk = []
        let all = []
        do {
            newChunk = await this.getModel({ modelGql, where, sortBy, first: chunkSize, skip: skip })
            all = all.concat(newChunk)
            skip += newChunk.length
        } while (--maxIterationsCount > 0 && newChunk.length)
        return all
    }

    async getModels ({ modelGql, where, first, skip, sortBy }) {
        const { data: { objs } } = await this.client.query({
            query: modelGql.GET_ALL_OBJS_QUERY,
            variables: {
                where,
                first,
                skip,
                sortBy,
            },
        })
        return objs
    }

    async updateModel ({ modelGql, id, updateInput }) {
        const { data: { obj: updatedObj } } = await this.client.mutate({
            mutation: modelGql.UPDATE_OBJ_MUTATION,
            variables: {
                id,
                data: {
                    ...this.dvSender(),
                    ...updateInput,
                },
            },
        })
        return updatedObj
    }


    async createModel ({ modelGql, createInput, isBatch = false }) {
        const client = isBatch ? this.batchClient : this.client
        const { data: { obj } } = await client.mutate({
            mutation: modelGql.CREATE_OBJ_MUTATION,
            variables: {
                data: {
                    ...this.dvSender(),
                    ...createInput,
                },
            },
        })
        return obj
    }

    errorLink () {
        return onError(({ graphQLErrors, networkError, operation }) => {
            if (graphQLErrors)
                graphQLErrors.map(({ message, path }) =>
                    logger.error('GraphQL error', { operation: operation.operationName, message, path }),
                )
            if (networkError) {
                logger.error('Network error', { networkError })
            }
        })
    }

    authLink () {
        return new ApolloLink((operation, forward) => {
            operation.setContext({
                headers: {
                    authorization: 'Bearer ' + this.authToken,
                    'accept-language': this.locale,
                },
            })
            return forward(operation)
        })
    }

    uploadTerminateLink () {
        return createUploadLink({ uri: this.endpoint, fetch })
    }

    batchTerminateLink () {
        return new BatchHttpLink({
            uri: this.endpoint,
            batchMax: MAX_REQUESTS_IN_BATCH, // No more than ... operations per batch
            batchInterval: 20,
        })
    }

}

module.exports = {
    CondoBot,
}

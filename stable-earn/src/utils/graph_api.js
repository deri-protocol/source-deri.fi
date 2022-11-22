const {GraphQLClient } = require('graphql-request')
const graphQLClient = new GraphQLClient("https://graph.deri.io/graphql", {})
export function graph_request_test(mutation,variables) {
    return graphQLClient.request(mutation,variables)
}
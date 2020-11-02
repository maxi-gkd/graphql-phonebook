const {
    ApolloServerPlugin,
} = require('apollo-server-plugin-base');

const UNKNOWN_OP = 'UNKNOWN_OP'
const LogPlugin = {
    requestDidStart(requestContext) {
      const start = Date.now()
      let op
  
      return {
        didResolveOperation (context) {
          op = context.operationName || UNKNOWN_OP
        },
        willSendResponse (context) {
          const stop = Date.now()
          const elapsed = stop - start
          const size = JSON.stringify(context.response).length * 2
          console.log(
            `Operation ${op} completed in ${elapsed} ms and returned ${size} bytes`
          )
        }
      }
    },
  }

module.exports = LogPlugin
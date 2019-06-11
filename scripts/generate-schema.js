const { Log              } = require('../build/backend/modules/debug');
const { makeApolloServer } = require('../build/backend/graphql/apollo-server.js')


makeApolloServer().then(() => Log.info('Schema was genereated'))

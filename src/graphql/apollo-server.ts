import * as I      from 'modules/interfaces';
import * as Apollo from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { GqlObjectIdScalar } from "graphql/scalars/object-id";
import { makeContext       } from 'graphql/resolve-context';
import { authChecker       } from 'graphql/auth-checker';

export async function makeApolloServer() {
    return new Apollo.ApolloServer({
        playground:    true,
        introspection: true,
        schema: await buildSchema({
            resolvers:      [`${__dirname}/../domains/*/resolver.js`],
            emitSchemaFile: 'src/common/schema.graphql',
            scalarsMap:     [{scalar: GqlObjectIdScalar, type: I.ObjectId }],
            authChecker
        }),
        context:     makeContext
    });
}

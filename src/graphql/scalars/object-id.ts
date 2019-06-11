import { ObjectId } from "modules/interfaces";
import { GraphQLScalarType, Kind } from "graphql";


function tryParseObjectId(id: string) {
    if (!ObjectId.isValid(id)) {
        throw new Error('invalid BsonObjectId format');
    }
    return new ObjectId(id);
}
export const GqlObjectIdScalar = new GraphQLScalarType({
    name:        'ObjectId',
    description: 'Bson ObjectId unique identifier (hexadecimal string).',
    serialize:   String,
    parseValue:  tryParseObjectId,
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return tryParseObjectId(ast.value);
        }
        throw new Error('ObjectId must be of string type');
    }
});

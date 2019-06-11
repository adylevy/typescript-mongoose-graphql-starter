import * as I from "modules/interfaces";
import { UserType, UserTryCrud, User } from 'domains/users/model';
import {
    Resolver,
    Query,
    Arg,
    Mutation
} from 'type-graphql';


@Resolver()
export class UserResolver {// implements ResolverInterface<UserData> {

    @Query(_returns => UserType)
    async getUser(@Arg('id') id: I.ObjectId) {
        return UserTryCrud.tryFindById(id);
    }

    @Mutation(_type => UserType)
    async createUser(@Arg('name') name: string, @Arg('password') password: string) {
        return User.create({ name, password, username: name });
    }

}


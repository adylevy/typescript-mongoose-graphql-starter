import {
    Field,
    ObjectType
} from 'type-graphql';

import { UserType } from 'domains/users/model';


@ObjectType()
export class LoginResponseType {
    @Field()
    jwt!: string;

    @Field()
    user!: UserType;
}

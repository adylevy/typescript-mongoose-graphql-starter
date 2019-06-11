import {
    Field,
    InputType
} from 'type-graphql';

import { UserPropLimits, Credentials } from 'domains/users/model';
import { LengthRange    } from 'modules/decorators/length-range';


@InputType()
export class LoginRequestType implements Credentials {

    @Field()
    @LengthRange(UserPropLimits.UsernameLength)
    username!: string;

    @Field()
    @LengthRange(UserPropLimits.PasswordLength)
    password!: string;

}

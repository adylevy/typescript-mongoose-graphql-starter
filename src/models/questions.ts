import * as Config from "config";
import * as Crypto from "crypto";
import * as Utils from "/modules/utils";
import * as I from "/modules/interfaces";
import * as JWT from "jsonwebtoken";

import { Typegoose, prop, staticMethod, instanceMethod, pre } from "typegoose";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { required, index, unique } from "modules/flags";
import { TryCrud } from "/modules/mongoose-utils/try-crud";
import { Paginator } from "/modules/mongoose-utils/paginate";
import { IntegerRange } from "/modules/integer-range";

export namespace UserPropLimits {
  export const PasswordLength = new IntegerRange(6, 38);
  export const UsernameLength = new IntegerRange(3, 255);
}

export enum UserRole {
  Admin = "admin",
  Guest = "guest",
  Regular = "regular"
}

registerEnumType(UserRole, {
  name: "UserRole",
  description: "Identifies user access level"
});

export interface Credentials {
  username: string;
  password: string;
}

@pre<UserType>("save", function (next: CallableFunction)  {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = UserType.encodePassword(this.password);
    next();
})

@ObjectType("User")
export class UserType extends Typegoose implements Credentials {
  @Field()
  @prop()
  get id(this: User): I.ObjectId {
    return this._id;
  }

  // @Field()
  // @prop({ required, default: false })
  // disabled!: boolean;

  @Field(_type => UserRole) // must be explicitly forwarded when using enums
  @prop({ required, enum: Object.values(UserRole), default: UserRole.Regular })
  role!: UserRole;

  @prop({ required })
  password!: string; // do not expose password as public GraphQL field

  @Field()
  @prop({ required, index, unique })
  username!: string;

  @Field()
  @prop({ required, default: Date.now })
  init_date!: Date;

  /**
   * Searches for `User` with the given `username` and `password`. Password is
   * automatically encoded before being propagated to the mongoose.
   *
   * @param username Target user username.
   * @param password Raw target user password.
   *
   */
  @staticMethod
  static async findByCredentials(
    this: UserModel,
    { username, password }: Credentials
  ) {
    return User.findOne({
      username,
      password: this.encodePassword(password)
    });
  }

  /**
   * Returns a hash-encoded representation of password to store in the database.
   * @param password Real password to be encoded.
   */
  @staticMethod
  public static encodePassword(password: string) {
    const hash = Crypto.createHmac("sha512", Config.PasswordSalt);
    hash.update(password);
    return hash.digest("hex");
  }

  @instanceMethod
  makeJWT(this: User) {
    const customPayload: I.JWT.Payload = {
      sub: String(this._id)
    };
    return JWT.sign(customPayload, Config.JWT.KeyPair.private, {
      expiresIn: Config.JWT.ExpirationTime,
      algorithm: Config.JWT.EncodingAlgorithm
    });
  }
}

export const User = Utils.getModelFromTypegoose(UserType);

export const UserTryCrud = new TryCrud(User);
export const UserPaginator = new Paginator<UserData, User>({ model: User });

export type User = InstanceType<UserModel>;
export type UserModel = typeof User;
export type UserData = I.TypegooseDocProps<UserType>;

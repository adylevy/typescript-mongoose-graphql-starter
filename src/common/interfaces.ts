/* tslint:disable:callable-types */
import * as Vts from "vee-type-safe";
export { Maybe } from "vee-type-safe";

export interface ClassType<TInstance = any, TArgs extends any[] = any[]>
    extends Function {
  new (...args: TArgs): TInstance;
}

export type ClassPrototype<
    TClass extends ClassType = ClassType
    > = TClass["prototype"];

export namespace JWT {
  export interface Payload {
    sub: string; // user id
  }
  export const PayloadTD: Vts.TypeDescrObject<Payload> = {
    sub: Vts.isBsonObjectIdString
  };
}

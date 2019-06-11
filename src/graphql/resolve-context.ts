import * as Express from 'express';
import * as I       from 'modules/interfaces';
import { User         } from 'domains/users/model';
import { authenticateJWT } from 'modules/authentication';

export interface ResolveContext {
    user?: I.Maybe<User>;
}

export interface ResolveContextFactoryOptions{
    req: Express.Request;
    // res: Express.Response;
}

export async function makeContext(
    {req}: ResolveContextFactoryOptions
): Promise<ResolveContext> {
    return { user: await authenticateJWT(req) };
}

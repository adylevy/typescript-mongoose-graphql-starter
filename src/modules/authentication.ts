import Passport  from 'passport';
import Express   from 'express';
import * as Vts       from 'vee-type-safe';
import * as I         from 'modules/interfaces';
import { ForbiddenError, } from 'modules/statused-error';

import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';


import * as Config     from 'config';
import { User, UserTryCrud } from 'domains/users/model';

Passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey:    Config.JWT.KeyPair.public
    },
    async (untrustedJwtPayload: unknown, done) => {
        const mismatch = Vts.mismatch(untrustedJwtPayload, I.JWT.PayloadTD);
        if (mismatch != null) {
            return done(new ForbiddenError(`invalid jwt, ${mismatch.toErrorString()}`));
        }
        const jwtPayload = untrustedJwtPayload as I.JWT.Payload;
        return UserTryCrud
            .tryFindById(new I.ObjectId(jwtPayload.sub))
            .then(user => done(null, user))
            .catch(done);
    }
));

export async function authenticateJWT(req: Express.Request) {
    return req.headers.authorization == null
        ? null
        : new Promise<I.Maybe<User>>(
            (resolve, reject) => Passport.authenticate('jwt', { session: false },
                (err, user?: I.Maybe<User>) => {
                    return err != null ? reject(err) : resolve(user);
                }
            )(req)
        );
}


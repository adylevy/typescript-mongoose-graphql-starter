import * as HttpCodes from 'http-status-codes';

export class StatusedError extends Error {
    constructor(message: string, public status: number){
        super(message);
    }
}

function makeSubclass(status: number, defaultMsg: string) {
    return class extends StatusedError {
        constructor(message = defaultMsg) {
            super(message, status);
        }
    };
}

export const NotFoundError     = makeSubclass(HttpCodes.NOT_FOUND, 'nothing was found');
export const BadRequestError   = makeSubclass(HttpCodes.BAD_REQUEST, 'bad request');
export const UnAuthorizedError = makeSubclass(HttpCodes.UNAUTHORIZED, 'authorization needed');
export const ForbiddenError    = makeSubclass(HttpCodes.FORBIDDEN, 'insufficient access level');
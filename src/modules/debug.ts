import Colors from 'colors/safe'; // import it only this way (https://github.com/Microsoft/TypeScript/issues/29687)
import * as Vts from 'vee-type-safe';

export namespace Log {
    function logCurrentTime() {
        return process.stdout.write(Colors.bold(Colors.gray(
            `${new Date().toUTCString()} │ `
        )));
    }

    /**
     * Logs current time with, optional description and detailed view on `payload` object.
     * If you have no object to view you may forward a single string message as a `payload`.
     * 
     * @param payload       Object, which state needs to be logged.
     * @param description   Additional info message to be logged before `payload`.
     */
    export function info(payload: unknown, description?: string) {
        logCurrentTime();
        console.log(Colors.blue(`Info: ${description || ''} `));
        console.dir(payload);
    }
    /**
     * The same as info(), but if `!(payload instanceof Error)` logs additional
     * stacktrace, otherwise uses provided `Error` stacktrace of `payload`.
     * Makes program to hault execution when invoking this function with debugger.
     * 
     * @param payload       `Error` or vanilla object, which state needs to be logged.
     * @param description   Additional info message to be logged before `payload`.
     */
    export function error(payload: unknown, description?: string) {
        debugger;
        logCurrentTime();
        console.log(Colors.red(`Error: ${description || ''} `));
        if (payload instanceof Error) {
            console.error(payload);
        } else {
            console.dir(payload);
            console.error(new Error('View stacktrace'));
        }
    }

    /**
     * Same as info(), but has warning style formatting.
     * 
     * @param payload       Vanilla object, which state needs to be logged.
     * @param description   Additional info message to be logged before `payload`.
     */
    export function warning(payload: unknown, description?: string) {
        logCurrentTime();
        console.log(Colors.yellow(`Warning: ${description || ''} `));
        console.dir(payload);
    }
}

/**
 * Aborts current program execution workflow after invoking `error(payload, description)`.
 * 
 * @param payload       `Error` or vanilla object, which state needs to be logged.
 * @param description   Additional info message to be logged before `payload`.
 */
export function shutdown(payload: unknown = 'undefined behaviour', description = ''): never {
    Log.error(payload, description);
    return process.exit(1);
}

/**
 * Checks that `Boolean(truthy) === true`, otherwise shutdowns and logs `truthy`.
 * 
 * @param truthy Suspect to be check for truthiness.
 */
export function assert(truthy: unknown) {
    if (!truthy) {
        shutdown(truthy, `assertion failure`);
    }
}

/**
 * Checks that `Boolean(truthy) === false`, otherwise shutdowns and logs `falsy`.
 * 
 * @param falsy Suspect to be check for truthiness.
 */
assert.falsy = (falsy: unknown) => {
    if (falsy) {
        shutdown(falsy, `assertion failure`);
    }
};


/**
 * Checks that `Vts.mismatch(suspect, typeDescr) === null`, otherwise shutdowns
 * and logs returned `MismatchInfo` object.
 * 
 * @param suspect   Value of to be checked for type conformance.
 * @param typeDescr `Vts.TypeDesciption` that `suspect` will be checked to match to.
 */
assert.matches = (suspect: unknown, typeDescr: Vts.TypeDescription) => {
    const mismatch = Vts.mismatch(suspect, typeDescr);
    if (mismatch) {
        shutdown(mismatch, 'type mismatch assertion failure');
    }
};
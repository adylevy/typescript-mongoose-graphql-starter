import * as I   from 'modules/interfaces';
import * as Vts from 'vee-type-safe';

export function getTypeScriptType(
    classPrototype: Vts.BasicObject,
    propName: string | symbol
): I.ClassType {
    return Reflect.getOwnMetadata(
        'design:type', classPrototype, propName
    );
}

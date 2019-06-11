import Vts      from 'vee-type-safe';
import Mongoose from 'mongoose';
import { Typegoose } from 'typegoose';
import { ClassType } from 'common/interfaces';

export * from 'common/interfaces';
export { ObjectId  } from 'mongodb';

/**
 * Defines a type that filters function (method) properties from the given
 * instance type.
 * @param TInstance Type of the instances created by `Typegoose` successor.
 *
 * @remarks
 * ```ts
 * import { Typegoose, prop, staticMethod, instanceMethod } from 'typegoose';
 * class AnimalType extends Typegoose {
 *     @prop() name:  string;
 *     @prop() force: number;
 *     @staticMethod   smeth() {}
 *     @instanceMethod imeth() {}
 * }
 * type AnimalData = TypegooseDocProps<AnimalType>;
 * // AnimalData === { name: string; force: number; }
 * ```
 */
export type TypegooseDocProps<TInstance extends Typegoose> = (
    FilterProps<TInstance, Function>
);

/**
 * Defines a union of property names taken from `TObj` which value type is not
 * assignable to `TValue`.
 *
 * @param TObj   Target object type to filter property names from.
 * @param TValue Type of value that filtered propnames value type
 *               must not be assignable to.
 */
export type FilteredPropNames<TObj extends Vts.BasicObject, TValue> = {
    [TKey in keyof TObj]: TObj[TKey] extends TValue ? never: TKey // never type gets filtered
}[keyof TObj];                                                    // according to union rules

/**
 * Defines an object type which properties are all taken from `TObj` and their values
 * are not assignable to `TValue`.
 *
 * @param TObj   Target object type to filter properties from.
 * @param TValue Type of value that filtered properties value type
 *               must not be assignable to.
 */
export type FilterProps<TObj extends Vts.BasicObject, TValue> = (
    Pick<TObj, FilteredPropNames<TObj, TValue>>
);

/**
 * Defines a corrected version of model retrieved from
 * `new TGDocClass().getModelForClass(TGDocClass)`,
 * where instance type properties and methods are filtered from the static model type.
 *
 * @param TClassTG Static (constructor) type of the `Typegoose` successor.
 *
 * @remarks
 * ```ts
 * import { Typegoose } from 'typegoose';
 * class AnimalType extends Typegoose {
 *      //...
 * }
 * const Animal: TypegooseModel<typeof AnimalType> = (
 *      new AnimalType().getModelForClass(AnimalType)
 * );
 *
 * ```
 */
export type TypegooseModel<TGDocClass extends ClassType> = (
    TGDocClass & Mongoose.Model<TypegooseDocument<TGDocClass>>
);

/**
 * Instance type of TypegooseModel<>.
 */
export type TypegooseDocument<TGDocClass extends ClassType> = (
    InstanceType<TGDocClass> & Mongoose.Document
);

import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import * as Vts      from 'vee-type-safe';
import * as Mongoose from 'mongoose';
import * as Utils    from '/modules/utils';

export interface Paginated<T> {
    total: number;
    data: T[];
}

/**
 * This type represents public query object, typically obtain through API query
 * to your server. It is used is passed apart from `PrivatePaginateOptions`, as
 * it has many restrictions to its shape.
 */
export interface PublicPaginateOptions<TPublicFields extends string> {
    /**
     * Represents 0-based offset within the documents collection.
     */
    offset: number;
    /**
     * Represents the maximum amount of documents to return.
     */
    limit: number;
    /**
     * Represents the search query, where keys correspond to documents keys and
     * values are of string types.
     *
     * If it is a string it will be converted to a regexp, so that any
     * string that includes it will math the criteria.
     *
     * If value is not a string, an error will be risen.
     *
     */
    search?: Vts.Maybe<Partial<Record<TPublicFields, Vts.Maybe<string>>>>;
    /**
     * Object where each key corresponds to documents keys and values define
     * their sort order.
     * Value may only be on of the two strings 'asc' or 'desc', otherwise an
     * Error will be risen.
     */
    sort: Partial<Record<TPublicFields, 'asc' | 'desc' | string>>;
    /**
     * Defines which values to `include` and which ones to `exclude`.
     * Beware that `include` prevails over `exclude`.
     * Each key of `filter.include/exclude` corresponds to document's key,
     * and value or array of values define items to `include/exclude`.
     *
     */
    filter?: Vts.Maybe<{
        include?: Vts.Maybe<Vts.BasicObject>
        exclude?: Vts.Maybe<Vts.BasicObject>
    }>;
}
/**
 * Here you may supply your custom additional filter/search option using public
 * query object.
 */
export interface PrivatePaginateOptions<TDocData extends Vts.BasicObject> {
    /**
     * This object will be `Object.assigned` to the utlimate search query,
     * passed to `model.paginate()` function. You may use any valid MongoDB
     * expression objects.
     */
    filter?: Vts.Maybe<{
        [TKey in keyof TDocData]: TDocData[TKey] | Vts.BasicObject
    }>;
}

export type DocFieldsAliases<TDocData extends Vts.BasicObject> = (
    Vts.MappedObject<Partial<TDocData>, string>
);

/**
 * Represents the shape of object passed to `Paginator` constructor.
 */
export interface PaginatorOptions<TDocData extends Vts.BasicObject> {
    /**
     * Target model, to paginate documents.
     */
    model:   Mongoose.Model<Mongoose.Document>;
    /**
     * An object that maps public aliases to document's fields.
     * E.g. if you want to expose `_id` field as `id`, you should
     * forward `aliases` as `{ _id: 'id' }`.
     *
     */
    aliases?: Vts.Maybe<DocFieldsAliases<TDocData>>;
}

/**
 * This class is a utility to paginate `Mongoose.Documents` conveniently.
 * You may use it when exposing pagination API.
 * @param TDocData Objet type that contains document's data payload.
 * @param TDoc     Subtype of `Mongoose.Document`, that you are paginating.
 *
 */
export class Paginator<
    TDocData      extends Vts.BasicObject,
    TDoc          extends Mongoose.Document,
    TPublicFields extends string = Extract<keyof TDocData, string>
>{
    private readonly model:      Mongoose.Model<Mongoose.Document>;
    private readonly aliases:    Vts.Maybe<DocFieldsAliases<TDocData>>;


    /**
     * Creates an instance of Paginator.
     *
     * @param model   `Mongoose.PaginateModel` of the target paginated documents.
     * @param aliases An object that maps public aliases to document's fields.
     *                E.g. if you want to expose `_id` field as `id`, you should
     *                forward `aliases` as `{ _id: 'id' }`.
     *
     * @remarks
     * Prerequisites: All `aliases` keys must be in model schema, or undefined
     * behaviour.
     */
    constructor({ model, aliases }: PaginatorOptions<TDocData>) {
        this.model   = model;
        this.aliases = aliases;
    }

    private mapKey(key: string) {
        return this.aliases != null && this.aliases[key] != null
            ? this.aliases[key]
            : key;
    }

    private isRequired(mappedKey: string) {
        if (mappedKey === '_id') {
            return true;
        }
        const schemaValue = this.model.schema.obj[mappedKey];
        return Utils.isPlainObject(schemaValue) && Boolean(schemaValue.required);
    }


    /**
     * Returns pagination result from the database.
     *
     * @param param0 Pagination options, @see PublicPaginateOptions for details.
     * @param privateOpts Defines options that this function will pass directly to
     *                   mongoose.
     *
     *
     * @throws Error | Vts.TypeMismatchError
     * If any type violations were found, or `model.paginate()` throws.
     */
    async paginate({
            offset,
            limit,
            search,
            sort,
            filter
        }: PublicPaginateOptions<TPublicFields>,
        privateOpts?: Vts.Maybe<PrivatePaginateOptions<TDocData>>
    ): Promise<Paginated<TDoc>> {
        Vts.ensureMatch(offset, Vts.isZeroOrPositiveInteger);
        Vts.ensureMatch(limit,  Vts.isZeroOrPositiveInteger);

        const mongoSearch = search == null ? {} :
            _.transform(search, this.transformQueryObj(
                Paginator.mapSearchValue
            ));

        const mongoExcludeFilter = filter == null || filter.exclude == null
            ? null
            : _.transform(filter.exclude, this.transformQueryObj((value, key) => (
                this.model.schema.path(key) instanceof Mongoose.Schema.Types.Array
                ? { $not: { $elemMatch: { $in: _.castArray(value) } } }
                : { $nin: _.castArray(value) }
            )));

        const mongoIncludeFilter = filter == null || filter.include == null ? null :
            _.transform(filter.include, this.transformQueryObj((value, key) => (
                    this.model.schema.path(key) instanceof Mongoose.Schema.Types.Array
                    ? { $all: _.castArray(value) }
                    : Array.isArray(value) ? { $in: value } : value
                )
            ));

        const mongoSort = _.transform(sort, this.transformQueryObj(
            Paginator.checkSortValue
        ));

        const mongoFilter = (
            mongoExcludeFilter == null ?
            mongoIncludeFilter         :
            mongoIncludeFilter == null ?
            mongoExcludeFilter         :
            { $and: [mongoIncludeFilter, mongoExcludeFilter] }
        );

        const findQuery = {
            ...mongoSearch,
            ...mongoFilter,
            ...(privateOpts != null ? privateOpts.filter : {})
        };
        const totalQuery = this.model.count(findQuery).exec();
        const docsQuery  = this.model
            .find(findQuery)
            .sort(mongoSort)
            .skip(offset)
            .limit(limit).exec();

        const [total, docs] = await Promise.all([totalQuery, docsQuery]);
        return  {
            total,
            data: docs as TDoc[]
        };
    }

    private transformQueryObj(
        transformValue: (value: unknown, schemaKey: string) => unknown
    ): _.MemoVoidDictionaryIterator<unknown, Vts.BasicObject> {
        return ((result, value, key) => {
            key = this.mapKey(key);
            if (this.model.schema.path(key) == null) {
                throw new Error(`Invalid query key ${key}`);
            }
            if (!this.isRequired(key) || value != null) {
                result[key] = transformValue(value, key);
            }
            return result;
        });
    }

    private static checkSortValue(value: unknown) {
        if (value === 'asc' || value === 'desc') {
            return value;
        } else throw new Error(
            `Sort value was expected to be only 'asc' or 'desc', but was '${value}'`
        );
    }

    private static mapSearchValue(value: unknown) {
        if (typeof value === 'string') {
            return new RegExp(escapeStringRegexp(value), 'i');
        } else throw new Error(
            `Expected string value for the search query, but got ${value}`
        );
    }
}

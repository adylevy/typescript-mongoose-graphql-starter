import _           from 'lodash';
import fetch, { Response } from 'node-fetch';
import QueryString from 'querystring';
import FormData    from 'form-data';
import * as Vts from 'vee-type-safe';
import { Log } from 'modules/debug';


export type JsonRoot = Vts.BasicObject | any[];

export type QueryParamsObj = Vts.BasicObject<
    | string   | number   | boolean
    | string[] | number[] | boolean[]
>;

export type FormDataObj = Vts.BasicObject;

export interface GetJsonOptions {
    endpoint:      string;
    /**
     * An object with keys as query keys and values as query values.
     * Arrays are converted to comma delimited lists.
     */
    queryParams:   QueryParamsObj;
    jsonTypedescr: Vts.TypeDescription;
}

/**
 * Executes GET request with the given `queryParams`.
 *
 * @throws Error | Vts.TypeMismatchError if network error occurs or
 *         `Vts.duckMismatch(fetchedJson, opts.jsonTypedescr) != null`
 *
 */
export async function getJson<TJsonResponse extends JsonRoot>(
    {queryParams, endpoint, jsonTypedescr}: GetJsonOptions
) {
    const queryParamsString = QueryString.stringify(_.mapValues(
        queryParams, val => Array.isArray(val) ? val.join(',') : val
    ));
    return tryGetJsonFromResponse<TJsonResponse>(
        await fetch(`${endpoint}?${queryParamsString}`,{ method: 'get' }),
        endpoint,
        jsonTypedescr
    );
}

export interface PostFormDataAndGetJsonOptions {
    formData:      FormDataObj;
    endpoint:      string;
    jsonTypedescr: Vts.TypeDescription;
}

/**
 * Executes POST request with the given `formData` (multipart/form-data).
 *
 *
 * @throws Error | Vts.TypeMismatchError if network error occurs or
 *         `Vts.duckMismatch(fetchedJson, opts.jsonTypedescr) != null`
 *
 */
export async function postFormDataAndGetJson<TJsonResponse extends JsonRoot>(
    {formData, endpoint, jsonTypedescr}: PostFormDataAndGetJsonOptions
) {
    const body = new FormData;

    _.forOwn(formData, (value, key) => void body.append(key, value));

    return tryGetJsonFromResponse<TJsonResponse>(
        await fetch(endpoint, { method: 'post', body }),
        endpoint,
        jsonTypedescr
    );
}

async function tryGetJsonFromResponse<TJsonResponse extends JsonRoot>(
    response: Response, endpoint: string, typeDescr: Vts.TypeDescription
) {
    if (!response.ok) {
        Log.info(response);
        throw new Error(`${endpoint} responded with '${response.statusText}'`);
    }

    const jsonResponse = await response.json();
    Vts.ensureDuckMatch(jsonResponse, typeDescr);
    return jsonResponse as TJsonResponse;
}


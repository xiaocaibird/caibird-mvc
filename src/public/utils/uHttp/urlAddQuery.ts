/**
 * @Owners cmZhou,zzh
 * @Title public urlAddQuery
 * @Details 给url字符串添加参数
 */
import uString from '../uString';

import parseUrl from './parseUrl';
import stringifyQuery from './stringifyQuery';

export const urlAddQuery = (
    url: string,
    params?: dp.Obj<dp.UrlParams> | string | null,
    opt: {
        isClear?: boolean,
        isSort?: boolean,
        sortFn?(a: string, b: string): number,
    } = {}) => {
    if (!params) return url;

    const { isClear, isSort } = opt;

    const query = (uString.check(params) ?
        (isClear || isSort ? stringifyQuery(parseUrl(params), opt) : params) :
        stringifyQuery(params, opt)).trim();
    if (url.includes('?')) {
        if (!url.endsWith('?') && !query.startsWith('&')) {
            return `${url}&${query}`;
        }
        return `${url}${query}`;
    }
    return `${url}?${query}`;
};

export default urlAddQuery;

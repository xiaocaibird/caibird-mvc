/**
 * @Creater cmZhou
 * @Desc public http工具
 */
import uString from './uString';

export namespace uHttp {
    export const urlAddQuery = (
        url: string,
        params?: string | dp.Obj<dp.UrlParams> | null,
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

    export const parseUrl = (url: dp.AllowNon<string>) => {
        const result: dp.Obj<string> = {};
        if (!url) return result;
        try {
            (!url.includes('?') ? `?${url.trim()}` : url.trim()).split('?')[1].split('&').forEach(item => {
                try {
                    const list = item.split('=');
                    if (list[0]) {
                        result[list[0]] = list[1] && decodeURIComponent(list[1]);
                    }
                } catch { }
            });
        } catch {
        }
        return result;
    };

    export const stringifyQuery = (
        obj: dp.AllowNon<dp.Obj<dp.UrlParams>>,
        opt: {
            isSort?: boolean,
            sortFn?(a: string, b: string): number,
        } = {}) => {
        try {
            if (!obj) return '';
            const { isSort, sortFn } = opt;

            let list = Object.keys(obj);

            if (isSort) {
                list = list.sort(sortFn);
            }

            return list.map(item => {
                try {
                    const value = obj[item];
                    if (value == null) {
                        return '';
                    }
                    return `${item}=${encodeURIComponent(value.toString())}`;
                } catch {
                    return '';
                }
            }).filter(item => !!item).join('&');
        } catch {
            return '';
        }
    };

    export const createFormData = (obj: dp.Obj<string | Blob>) => {
        const formData = new FormData();
        Object.keys(obj).forEach(item => formData.append(item, obj[item]));
        return formData;
    };
}

export default uHttp;

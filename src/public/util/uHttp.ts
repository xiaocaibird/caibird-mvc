/**
 * Created by cmZhou
 * public http工具
 */
import uString from './uString';

namespace _uHttp {
    export const urlAddQuery = (url: string, params?: string | dp.Obj | null) => {
        if (!params) return url;
        const query = (uString.check(params) ? params : paramsToQuery(params)).trim();
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
                const list = item.split('=');
                if (list[0]) {
                    result[list[0]] = list[1] && decodeURIComponent(list[1]);
                }
            }
            );
        } catch {
        }
        return result;
    };

    export const paramsToQuery = (obj: dp.AllowNon<dp.Obj<dp.UrlParams>>) => {
        if (!obj) return '';
        return Object.keys(obj).map(item => {
            let value = '';
            try {
                const param = obj[item];
                if (param == null) {
                    return '';
                }
                value = param.toString();
            } catch {
            }
            return `${item}=${encodeURIComponent(value)}`;
        }
        ).filter(item => !!item).join('&');
    };

    export const createFormData = (obj: dp.Obj<string | Blob>) => {
        const formData = new FormData();
        Object.keys(obj).forEach(item => formData.append(item, obj[item]));
        return formData;
    };
}

export const uHttp: dp.DeepReadonly<typeof _uHttp> = _uHttp;
export default uHttp;

/**
 * @Owners cmZhou,zzh
 * @Title public stringifyQuery
 * @Details 把query对象解析为字符串
 */
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

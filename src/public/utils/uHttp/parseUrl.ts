/**
 * @Owners cmZhou,zzh
 * @Title public parseUrl
 * @Details 把url字符串解析为对象
 */
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

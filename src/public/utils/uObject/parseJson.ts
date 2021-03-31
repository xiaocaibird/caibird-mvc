/**
 * @Owners cmZhou,zzh
 * @Title public parseJson
 * @Details 把字符串转为obj，做了兼容处理，如果parse失败返回null
 */

export const parseJson = <T>(str: dp.AllowNon<string>) => {
    if (!str) return null;
    try {
        return JSON.parse(str) as T;
    } catch {
        return null;
    }
};

export default parseJson;

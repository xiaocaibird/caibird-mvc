/**
 * @Owners cmZhou,zzh
 * @Title public getSafeJsonObj
 */
import parseJson from './parseJson';
import safeStringify from './safeStringify';

export const getSafeJsonObj = <T extends dp.Obj>(obj: T) => {
    const res = parseJson<T>(safeStringify(obj));
    if (res) return res;
    throw new Error('getSafeJsonObj 执行异常');
};

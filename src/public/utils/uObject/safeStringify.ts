/**
 * @Owners zzh
 * @Title public stringify
 * @Details 避免循环引用抛出异常 https://github.com/moll/json-stringify-safe
 */
import safeStringify from 'json-stringify-safe';

export const stringify = safeStringify;
export default stringify;

/**
 * @Owners cmZhou,zzh
 * @Title public check
 * @Details 检查一个参数是否为函数类型
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const check = <T extends Function = Function>(fn: unknown): fn is T => typeof fn === 'function';

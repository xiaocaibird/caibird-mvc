/**
 * @Owners cmZhou,zzh
 * @Title public check
 * @Details 检查一个输入是否为字符串
 */

export const check = (obj: unknown): obj is string => typeof obj === 'string';

/**
 * @Owners cmZhou,zzh
 * @Title public check函数
 * @Details 检查一个输入是否为object类型
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const check = (obj: unknown): obj is object => typeof obj === 'object';

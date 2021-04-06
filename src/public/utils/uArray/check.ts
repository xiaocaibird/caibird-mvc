/**
 * @Owners cmZhou,zzh
 * @Title public array check方法
 * @Details 检查一个输入是否为数组
 */
export const check = <T>(obj: unknown): obj is T[] => obj instanceof Array;

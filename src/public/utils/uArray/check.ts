/**
 * @Owners zzh
 * @Title public array check方法
 */
export const check = <T>(obj: unknown): obj is T[] => obj instanceof Array;

export default check;
/**
 * @Owners cmZhou,zzh
 * @Title public clear函数
 * @Details 去除<>,</>标签
 */
export const clear = (html: string) => html.replace(/<\/?[^>]*>/g, '');


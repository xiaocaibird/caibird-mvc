/**
 * @Owners zzh
 * @Title public check函数
 * @Details 检查一个输入是否为number类型
 */

export const check = (num: unknown): num is number => typeof num === 'number';

export default check;

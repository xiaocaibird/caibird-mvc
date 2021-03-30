/**
 * @Owners zzh
 * @Title public check函数
 * @Details 检查一个输入是否为obejct类型
 */

export const check = (obj: unknown): obj is dp.Obj => typeof obj === 'object';

export default check;

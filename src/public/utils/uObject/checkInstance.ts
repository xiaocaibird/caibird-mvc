/**
 * @Owners zzh
 * @Title public checkInstance函数
 * @Details 检查一个对象是否是另一个参数的实例
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkInstance = <I, T extends dp.Class<any[], any>>(obj: I, type: T): obj is InstanceType<T> => obj instanceof type;

export default checkInstance;

/**
 * @Owners cmZhou,zzh
 * @Title public check
 * @Details 判断子类型是否继承自父类
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const checkExtendsClass = <T extends Function>(sonClass: Caibird.dp.Nullable<Function>, fatherClass: T): sonClass is T =>
  sonClass ? Object.isPrototypeOf.call(fatherClass.prototype, sonClass.prototype as Caibird.dp.Obj) : false;

/**
 * @Creater cmZhou
 * @Desc public 函数工具
 */
namespace _uFunction {
    export const NOOP = () => { };

    export const check = <T extends Function = Function>(fn: unknown): fn is T => typeof fn === 'function';

    export const checkExtendsClass = <T extends Function>(sonClass: dp.AllowNon<Function>, fatherClass: T): sonClass is T =>
        sonClass ? !!(fatherClass.prototype as { isPrototypeOf: Function }).isPrototypeOf(sonClass.prototype) : false;
}

export const uFunction: dp.DeepReadonly<typeof _uFunction> = _uFunction;
export default uFunction;

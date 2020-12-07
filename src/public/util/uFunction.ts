/**
 * @Creater cmZhou
 * @Desc public 函数工具
 */
export namespace uFunction {
    export const noop = () => { };

    export const check = <T extends Function = Function>(fn: unknown): fn is T => typeof fn === 'function';

    export const checkExtendsClass = <T extends Function>(sonClass: dp.AllowNon<Function>, fatherClass: T): sonClass is T =>
        sonClass ? !!(fatherClass.prototype as { isPrototypeOf: Function }).isPrototypeOf(sonClass.prototype) : false;
}

export default uFunction;

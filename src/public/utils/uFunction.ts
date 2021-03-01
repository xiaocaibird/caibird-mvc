/**
 * @Creater cmZhou
 * @Desc public 函数工具
 */
export namespace uFunction {
    export const noop = () => { };

    // eslint-disable-next-line @typescript-eslint/ban-types
    export const check = <T extends Function = Function>(fn: unknown): fn is T => typeof fn === 'function';

    // eslint-disable-next-line @typescript-eslint/ban-types
    export const checkExtendsClass = <T extends Function>(sonClass: dp.AllowNon<Function>, fatherClass: T): sonClass is T =>
        sonClass ? !!(fatherClass.prototype as { isPrototypeOf: dp.Func }).isPrototypeOf(sonClass.prototype) : false;
}

export default uFunction;

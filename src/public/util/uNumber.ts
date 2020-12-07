/**
 * @Creater cmZhou
 * @Desc public number工具
 */
export namespace uNumber {
    export const check = (num: unknown): num is number => typeof num === 'number';

    export const toFixed = (num: number, count = 1, type: 'round' | 'floor' | 'ceil' = 'round') => {
        const powBase = 10;
        return Math[type](num * Math.pow(powBase, count)) / Math.pow(powBase, count);
    };
}

export default uNumber;

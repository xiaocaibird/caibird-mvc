/**
 * @Owners cmZhou
 * @Title public number工具
 */
export namespace uNumber {
    export const check = (num: unknown): num is number => typeof num === 'number';

    export const toFixed = (num: number, count = 1, type: 'ceil' | 'floor' | 'round' = 'round') => {
        const powBase = 10;
        return Math[type](num * Math.pow(powBase, count)) / Math.pow(powBase, count);
    };
}

export default uNumber;

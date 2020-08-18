/**
 * Created by cmZhou
 * public number工具
 */
namespace _uNumber {
    export const check = (num: unknown): num is number => typeof num === 'number';

    export const toFixed = (num: number, count = 1) => {
        const powBase = 10;
        return Math.round(num * Math.pow(powBase, count)) / Math.pow(powBase, count);
    };
}

export const uNumber: dp.DeepReadonly<typeof _uNumber> = _uNumber;
export default uNumber;

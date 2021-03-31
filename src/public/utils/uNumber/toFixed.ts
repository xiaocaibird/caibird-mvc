/**
 * @Owners cmZhou,zzh
 * @Title public toFixed函数
 * @Details 格式化一个数值
 */

export const toFixed = (num: number, count = 1, type: 'ceil' | 'floor' | 'round' = 'round') => {
    const powBase = 10;
    return Math[type](num * Math.pow(powBase, count)) / Math.pow(powBase, count);
};

export default toFixed;

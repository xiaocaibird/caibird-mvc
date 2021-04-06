/**
 * @Owners cmZhou,zzh
 * @Title sleep函数，返回一个promise
 */

export const sleep = async (delay = 100) => new Promise<undefined>(resolve => {
    setTimeout(resolve, delay);
});


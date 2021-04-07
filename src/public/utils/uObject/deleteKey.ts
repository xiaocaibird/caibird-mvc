/**
 * @Owners cmZhou,zzh
 * @Title public deleteKey
 * @Details 删除某个key
 */

export const deleteKey = <T extends dCaibird.Obj>(obj: T, key: keyof T) => {
    delete obj[key];
    return obj;
};

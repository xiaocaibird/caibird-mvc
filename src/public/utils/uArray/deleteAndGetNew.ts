/**
 * @Owners cmZhou,zzh
 * @Title public array deleteAndGetNew
 * @Details 删除数组某个item的值并返回新数组
 */

export const deleteAndGetNew = <TItem>(list: TItem[], index: number, length = 1) => {
    const newList = list.slice();
    newList.splice(index, length);
    return newList;
};

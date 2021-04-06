/**
 * @Owners cmZhou,zzh
 * @Title public array insertAndGetNew
 * @Details 插入某个item的值并返回新数组
 */

export const insertAndGetNew = <TItem>(list: TItem[], item: TItem, index = list.length) => {
    const newList = list.slice();
    newList.splice(index, 0, item);
    return newList;
};

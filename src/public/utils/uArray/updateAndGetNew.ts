/**
 * @Owners zzh
 * @Title public array updateAndGetNew
 * @Details 更新数组某个item的值并返回新数组
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateAndGetNew = <TItem extends dp.Obj<any> | null | undefined>(list: TItem[], value: Partial<TItem>, index: number) => {
    const newList = list.slice();

    if (index < 0 || index >= newList.length) return newList;

    if (newList[index] || value) {
        newList[index] = {
            ...newList[index],
            ...value,
        };
    } else {
        newList[index] = value;
    }

    return newList;
};

export default updateAndGetNew;

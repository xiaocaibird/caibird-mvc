/**
 * Created by cmZhou
 * public array工具
 */
namespace _uArray {
    export const check = <T extends any[] = any[]>(obj: unknown): obj is T => obj instanceof Array;

    export const jsonParseOrEmpty = <T extends any[]>(str: string): T => {
        try {
            const arr = JSON.parse(str);
            return check<T>(arr) ? arr : [] as any;
        } catch {
            return [] as any;
        }
    };

    export const updateAndGetNew = <TItem extends object>(list: TItem[], value: Partial<TItem>, index: number) => {
        const newList = list.slice();

        if (!newList[index]) return newList;

        newList[index] = {
            ...newList[index],
            ...value
        };
        return newList;
    };

    export const deleteAndGetNew = <TItem extends object>(list: TItem[], index: number, length = 1) => {
        const newList = list.slice();
        newList.splice(index, length);
        return newList;
    };

    export const insertAndGetNew = <TItem extends object>(list: TItem[], item: TItem, index = list.length) => {
        const newList = list.slice();
        newList.splice(index, 0, item);
        return newList;
    };
}

export const uArray: dp.DeepReadonly<typeof _uArray> = _uArray;
export default uArray;

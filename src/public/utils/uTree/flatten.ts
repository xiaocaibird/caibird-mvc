/**
 * @Owners cmZhou,zzh
 * @Title public flatten函数
 * @Details 打平树结构
 */
import uObject from '../uObject';

type FlattenOption<TKeepChildren extends boolean | undefined> = { keepChildren?: TKeepChildren };
const _flatten = <TBase extends dData.Tree.Base, TKeepChildren extends boolean | undefined>(
    list: dData.Tree.Item<TBase>[],
    result: (TKeepChildren extends true ? dData.Tree.Item<TBase> : TBase)[],
    opt: FlattenOption<TKeepChildren> = {}) => {
    const { keepChildren } = opt;

    list.forEach(item => {
        let newItem: dp.Obj = {
            ...item,
        };

        newItem = keepChildren ? newItem : uObject.deleteKey(newItem, 'children');

        result.push(newItem as TKeepChildren extends true ? dData.Tree.Item<TBase> : TBase);
        if (item.children?.length) {
            _flatten(item.children, result, opt);
        }
    });
    return result;
};
export const flatten = <TBase extends dData.Tree.Base, TKeepChildren extends boolean | undefined = undefined>(
    list: dData.Tree.Item<TBase>[],
    opt: FlattenOption<TKeepChildren> = {}) => _flatten(list, [], opt);

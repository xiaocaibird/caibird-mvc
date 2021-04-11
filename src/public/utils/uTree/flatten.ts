/**
 * @Owners cmZhou,zzh
 * @Title public flatten函数
 * @Details 打平树结构
 */
import { uObject } from '../uObject';

import type { dTree } from './';

type FlattenOption<TKeepChildren extends boolean | undefined> = { keepChildren?: TKeepChildren };
const _flatten = <TBase extends dTree.Base, TKeepChildren extends boolean | undefined>(
    list: dTree.Item<TBase>[],
    result: (TKeepChildren extends true ? dTree.Item<TBase> : TBase)[],
    opt: FlattenOption<TKeepChildren> = {}) => {
    const { keepChildren } = opt;

    list.forEach(item => {
        let newItem: Caibird.dp.Obj = {
            ...item,
        };

        newItem = keepChildren ? newItem : uObject.deleteKey(newItem, 'children');

        result.push(newItem as TKeepChildren extends true ? dTree.Item<TBase> : TBase);
        if (item.children?.length) {
            _flatten(item.children, result, opt);
        }
    });
    return result;
};
export const flatten = <TBase extends dTree.Base, TKeepChildren extends boolean | undefined = undefined>(
    list: dTree.Item<TBase>[],
    opt: FlattenOption<TKeepChildren> = {}) => _flatten(list, [], opt);

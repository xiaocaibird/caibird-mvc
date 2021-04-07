/**
 * @Owners cmZhou,zzh
 * @Title public flatten函数
 * @Details 打平树结构
 */
import { uObject } from '../uObject';

import type { uTree } from './';

type FlattenOption<TKeepChildren extends boolean | undefined> = { keepChildren?: TKeepChildren };
const _flatten = <TBase extends uTree.D.Base, TKeepChildren extends boolean | undefined>(
    list: uTree.D.Item<TBase>[],
    result: (TKeepChildren extends true ? uTree.D.Item<TBase> : TBase)[],
    opt: FlattenOption<TKeepChildren> = {}) => {
    const { keepChildren } = opt;

    list.forEach(item => {
        let newItem: dCaibird.Obj = {
            ...item,
        };

        newItem = keepChildren ? newItem : uObject.deleteKey(newItem, 'children');

        result.push(newItem as TKeepChildren extends true ? uTree.D.Item<TBase> : TBase);
        if (item.children?.length) {
            _flatten(item.children, result, opt);
        }
    });
    return result;
};
export const flatten = <TBase extends uTree.D.Base, TKeepChildren extends boolean | undefined = undefined>(
    list: uTree.D.Item<TBase>[],
    opt: FlattenOption<TKeepChildren> = {}) => _flatten(list, [], opt);

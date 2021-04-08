/**
 * @Owners cmZhou,zzh
 * @Title public flatten函数
 * @Details 打平树结构
 */
import { uObject } from '../uObject';

import type { uTreeDeclare } from './';

type FlattenOption<TKeepChildren extends boolean | undefined> = { keepChildren?: TKeepChildren };
const _flatten = <TBase extends uTreeDeclare.Base, TKeepChildren extends boolean | undefined>(
    list: uTreeDeclare.Item<TBase>[],
    result: (TKeepChildren extends true ? uTreeDeclare.Item<TBase> : TBase)[],
    opt: FlattenOption<TKeepChildren> = {}) => {
    const { keepChildren } = opt;

    list.forEach(item => {
        let newItem: dCaibird.Obj = {
            ...item,
        };

        newItem = keepChildren ? newItem : uObject.deleteKey(newItem, 'children');

        result.push(newItem as TKeepChildren extends true ? uTreeDeclare.Item<TBase> : TBase);
        if (item.children?.length) {
            _flatten(item.children, result, opt);
        }
    });
    return result;
};
export const flatten = <TBase extends uTreeDeclare.Base, TKeepChildren extends boolean | undefined = undefined>(
    list: uTreeDeclare.Item<TBase>[],
    opt: FlattenOption<TKeepChildren> = {}) => _flatten(list, [], opt);

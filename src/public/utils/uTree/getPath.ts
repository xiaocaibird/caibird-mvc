/**
 * @Owners cmZhou,zzh
 * @Title public getPath函数
 * @Details 获取一个tree结构的某个id的链路
 */
import type { dTree } from './';
import { flatten } from './flatten';

const _getPath = <TBase extends dTree.Base, TId extends dTree.Id>(id: TId, treeList: TBase[], result: TBase[]) => {
    const item = treeList.find(one => one.id === id);
    if (item) {
        result.push(item);
        if (item.pid) _getPath(item.pid, treeList, result);
    }
    return result;
};
export const getPath = <TBase extends dTree.Base, TId extends dTree.Id>(id: TId, treeList: dTree.Item<TBase>[]) => _getPath(id, flatten(treeList), []);

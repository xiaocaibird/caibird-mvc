/**
 * @Owners cmZhou,zzh
 * @Title public create函数
 * @Details 根据pid构建树结构
 */
import type { dTree } from '../../@types/declares';

export const create = <TBase extends dTree.Base, TId extends dTree.Id>(list: TBase[], pid?: TId | null) =>
    list.filter(value => (pid == null && value.pid == null) || pid === value.pid).map(value => {
        const item: TBase & { children?: TBase[] } = { ...value };
        const children = create(list, value.id);
        if (children.length) {
            item.children = children;
        }
        return item;
    });

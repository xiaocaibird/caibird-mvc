/**
 * @Owners cmZhou,zzh
 * @Title public tree工具
 */

import { create } from './create';
import { flatten } from './flatten';
import { getPath } from './getPath';

export declare namespace dTree {
    type Id = number | string;
    type Base = { id: Id, pid?: Id | null };
    type Item<T extends Base> = T & { children?: Item<T>[] };
}

export const uTree = {
    create,
    flatten,
    getPath,
};

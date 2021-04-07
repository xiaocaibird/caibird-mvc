/**
 * @Owners cmZhou,zzh
 * @Title public tree工具
 */

import { create } from './create';
import { flatten } from './flatten';
import { getPath } from './getPath';

export const uTree = {
    create,
    flatten,
    getPath,
};

export declare namespace uTree {
    namespace D {
        type Id = number | string;
        type Base = { id: Id, pid?: Id | null };
        type Item<T extends Base> = T & { children?: Item<T>[] };
    }
}

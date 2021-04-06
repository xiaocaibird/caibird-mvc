/**
 * @Owners cmZhou,zzh
 * @Title public array工具
 */
import { check } from './check';
import { deleteAndGetNew } from './deleteAndGetNew';
import { insertAndGetNew } from './insertAndGetNew';
import { jsonParse } from './jsonParse';
import { updateAndGetNew } from './updateAndGetNew';

export const uArray = {
    check,
    jsonParse,
    updateAndGetNew,
    deleteAndGetNew,
    insertAndGetNew,
};

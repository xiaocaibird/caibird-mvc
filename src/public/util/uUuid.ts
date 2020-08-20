/**
 * Created by cmZhou
 * uuid util
 */
import { v4 } from 'uuid';

namespace _uUuid {
    export const get = (...params: dp.GetFuncParams<typeof v4>) => v4(...params).replace(/-/g, '');
}

export const uUuid: dp.DeepReadonly<typeof _uUuid> = _uUuid;
export default uUuid;

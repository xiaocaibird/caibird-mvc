/**
 * Created by cmZhou
 * uuid util
 */
import uuid from 'uuid';

namespace _uUuid {
    export const get = (...params: dp.GetFuncParams<typeof uuid['v4']>) => uuid.v4(...params).replace(/-/g, '');
}

export const uUuid: dp.DeepReadonly<typeof _uUuid> = _uUuid;
export default uUuid;

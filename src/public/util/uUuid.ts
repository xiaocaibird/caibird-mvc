/**
 * @Creater cmZhou
 * @Desc uuid util
 */
import { v1, v4, v5 } from 'uuid';

namespace _uUuid {
    type HandleOpt = {
        keepSeparator?: boolean;
    };

    const handleUuid = (uuid: string, opt: HandleOpt = {}) => {
        const { keepSeparator } = opt;

        if (keepSeparator) {
            return uuid;
        }

        return uuid.replace(/-/g, '');
    };

    export const get = (keepSeparator = false, ...params: dp.GetFuncParams<typeof v1>) => handleUuid(v1(...params), { keepSeparator });

    export const random = (keepSeparator = false, ...params: dp.GetFuncParams<typeof v4>) => handleUuid(v4(...params), { keepSeparator });

    export const getByNamespace = (keepSeparator = false, ...params: dp.GetFuncParams<typeof v5>) => handleUuid(v5(...params), { keepSeparator });
}

export const uUuid: dp.DeepReadonly<typeof _uUuid> = _uUuid;
export default uUuid;

/**
 * @Creater cmZhou
 * @Desc public obj工具
 */
import stringify from 'json-stringify-safe';

export namespace uObject {
    // eslint-disable-next-line @typescript-eslint/ban-types
    export const check = (obj: unknown): obj is object => typeof obj === 'object';

    export const checkInstance = <I, T extends dp.Class>(obj: I, type: T): obj is InstanceType<T> => obj instanceof type;

    export const removeUndefinedProp = <T extends dp.Obj>(value: T) => {
        const result = {
            ...value
        };
        for (const k in result) {
            if (result[k] === undefined) {
                delete result[k];
            }
        }

        return result;
    };

    export const deleteKey = <T extends dp.Obj>(obj: T, key: keyof T) => {
        delete obj[key];
        return obj;
    };

    export const parseJson = <T>(str: dp.AllowNon<string>) => {
        if (!str) return null;
        try {
            return JSON.parse(str) as T;
        } catch {
            return null;
        }
    };

    export const safeStringify = stringify;

    export const getSafeJsonObj = <T extends dp.Obj>(obj: T) => parseJson<T>(safeStringify(obj)) as unknown;
}

export default uObject;

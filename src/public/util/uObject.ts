/**
 * @Creater cmZhou
 * @Desc public obj工具
 */
import stringify from 'json-stringify-safe';

export namespace uObject {
    export const check = (obj: unknown): obj is object => typeof obj === 'object';

    export const checkInstance = <I, T extends dp.Class>(obj: I, type: T): obj is InstanceType<T> => obj instanceof type;

    export const removeUndefinedProp = <T extends object>(value: T) => {
        const reslut: Partial<T> = {};
        for (const key in value) {
            const k: keyof T = key;
            if (value[k] !== undefined) {
                reslut[k] = value[k];
            }
        }

        return reslut as T;
    };

    export const deleteKey = <T extends object>(obj: T, key: keyof T) => {
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

    export const getSafeJsonObj = <T extends object>(obj: T) => parseJson(safeStringify(obj)) as T;
}

export default uObject;

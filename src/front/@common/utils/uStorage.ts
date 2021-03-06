/**
 * @Owners cmZhou
 * @Title storage 工具
 */
import { uObject } from './uObject';
export namespace uStorage {
    export const clear = () => {
        if (localStorage) {
            localStorage.clear();
        }
    };

    export const getValue = (key: string) => {
        if (localStorage) {
            return localStorage.getItem(key);
        }
        return undefined;
    };

    export const setValue = (key: string, value: string) => {
        if (localStorage) {
            localStorage.setItem(key, value);
        }
    };

    export const remove = (key: string) => {
        if (localStorage) {
            localStorage.removeItem(key);
        }
    };

    const objectKey = '__caibird-mvc_custom_storage_obj___';

    export const getObjectValue = <T>(key: string) => {
        const objStr = getValue(objectKey);
        try {
            const obj = JSON.parse(objStr ?? '') as dp.Obj;
            return obj[key] as T;
        } catch {
            return undefined;
        }
    };

    export const setObjectValue = (key: string, value: unknown) => {
        const objStr = getValue(objectKey);
        let obj: dp.Obj = {};
        try {
            obj = JSON.parse(objStr ?? '') as dp.Obj;
        } catch {
        }
        obj[key] = value;
        setValue(objectKey, uObject.safeStringify(obj));
    };
}

export default uStorage;

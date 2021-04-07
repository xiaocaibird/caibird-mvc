/**
 * @Owners cmZhou
 * @Title sessionStorage 工具
 */
import { uObject } from './uObject';
export namespace uSessionStorage {
    export const clear = () => {
        if (sessionStorage) {
            sessionStorage.clear();
        }
    };

    export const getValue = (key: string) => {
        if (sessionStorage) {
            return sessionStorage.getItem(key);
        }
        return undefined;
    };

    export const setValue = (key: string, value: string) => {
        if (sessionStorage) {
            sessionStorage.setItem(key, value);
        }
    };

    export const remove = (key: string) => {
        if (sessionStorage) {
            sessionStorage.removeItem(key);
        }
    };

    const objectKey = '__caibird_custom_session_storage_obj___';

    export const getObjectValue = <T>(key: string) => {
        const objStr = getValue(objectKey);
        try {
            const obj = JSON.parse(objStr ?? '') as dCaibird.Obj;
            return obj[key] as T;
        } catch {
            return undefined;
        }
    };

    export const setObjectValue = (key: string, value: unknown) => {
        const objStr = getValue(objectKey);
        let obj: dCaibird.Obj = {};
        try {
            obj = JSON.parse(objStr ?? '') as dCaibird.Obj;
        } catch {
        }
        obj[key] = value;
        setValue(objectKey, uObject.safeStringify(obj));
    };
}

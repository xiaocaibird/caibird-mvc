/**
 * @Creater cmZhou
 * @Desc storage 工具
 */
import { uObject } from './uObject';
namespace _uStorage {
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

    export const getObjectValue = (key: string) => {
        const objStr = getValue(objectKey);
        try {
            const obj = JSON.parse(objStr || '') as dp.Obj;
            return obj[key];
        } catch {
            return undefined;
        }
    };

    export const setObjectValue = (key: string, value: any) => {
        const objStr = getValue(objectKey);
        let obj: dp.Obj = {};
        try {
            obj = JSON.parse(objStr || '') as dp.Obj;
        } catch {
        }
        obj[key] = value;
        setValue(objectKey, uObject.safeStringify(obj));
    };
}

export const uStorage: dp.DeepReadonly<typeof _uStorage> = _uStorage;
export default uStorage;

/**
 * Created by cmZhou
 * 公共的常用类型
 */
declare global {
    namespace dp {
        type AllowNon<T> = T | undefined | null;

        type AllowValueNon<T extends object> = {
            [P in keyof T]?: T[P] | null;
        };

        type UrlParams = number | string | boolean | null | undefined;

        type Keys = keyof any;

        type Obj<T = any> = {
            [K in Keys]: T;
        };

        type StrictObj<K extends number | string, T = any> = {
            [k in K]: T;
        };

        type Func<P extends any[] = any[], T = any> = (...p: P) => T;

        type Class<P extends any[] = any[], T = any> = new (...p: P) => T;

        type MapType<K = any, V = any> = Map<K, V>;

        type GetClassParams<T extends Class> = T extends Class<infer P> ? P : never;

        type GetFuncParams<T extends Func> = T extends Func<infer P> ? P : never;

        type PromiseFunc<P extends any[] = any[], T = any> = (...p: P) => Promise<T>;

        type PromiseOrSelf<T> = Promise<T> | T;

        type AllowKeys<T extends { [p in Exclude<keyof T, K>]: never }, K extends string> = T;

        type NeedKeys<T extends Record<K, any>, K extends string> = T;

        type StrictKeys<T extends Record<K, any> & { [p in Exclude<keyof T, K>]: never }, K extends string> = T;

        type DeepReadonly<T> =
            T extends Function ? T :
            T extends Map<infer K, infer V> ? DeepReadonlyMap<K, V> :
            T extends Set<infer T> ? DeepReadonlySet<T> :
            T extends any[] ? DeepReadonlyArray<T[number]> :
            T extends object ? DeepReadonlyObject<T> : T;

        type DeepWritable<T> =
            T extends Function ? T :
            T extends Map<infer K, infer V> ? DeepWritableMap<K, V> :
            T extends Set<infer T> ? DeepWritableSet<T> :
            T extends any[] ? DeepWritableArray<T[number]> :
            T extends object ? DeepWritableObject<T> : T;

        type DeepPartial<T> =
            T extends Function ? T :
            T extends Map<infer K, infer V> ? DeepPartialMap<K, V> :
            T extends Set<infer T> ? DeepPartialSet<T> :
            T extends any[] ? DeepPartialArray<T[number]> :
            T extends object ? DeepPartialObject<T> : T;

        type NonFuncProp<T> = Pick<T, NonFuncPropNames<T>>;
        type NonFuncPropNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

        type PromiseFuncProp<T> = Pick<T, PromiseFuncPropNames<T>>;
        type PromiseFuncPropNames<T> = { [K in keyof T]: T[K] extends PromiseFunc ? K : never }[keyof T];

        interface CustomProcessEnv {
            RUN_ENV: any;

            APP_VERSION: any;
            TAG_NAME: any;

            NODE_ENV_VALUE: any;

            IS_PRODUCTION: any;
            IS_EXP_PRODUCTION: any;

            IS_TEST: any;
            IS_LOCAL_TEST: any;
        }
    }
}

export = dp;

//#region 私有类型
interface DeepReadonlyMap<K, V> extends ReadonlyMap<K, dp.DeepReadonly<V>> { }

interface DeepReadonlySet<T> extends ReadonlySet<dp.DeepReadonly<T>> { }

interface DeepReadonlyArray<T> extends ReadonlyArray<dp.DeepReadonly<T>> { }

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: dp.DeepReadonly<T[P]>;
};

interface DeepWritableMap<K, V> extends Map<K, dp.DeepWritable<V>> { }

interface DeepWritableSet<T> extends Set<dp.DeepWritable<T>> { }

interface DeepWritableArray<T> extends Array<dp.DeepWritable<T>> { }

type DeepWritableObject<T> = {
    -readonly [P in keyof T]: dp.DeepWritable<T[P]>;
};

interface DeepPartialMap<K, V> extends Map<K, dp.DeepPartial<V>> { }

interface DeepPartialSet<T> extends Set<dp.DeepPartial<T>> { }

interface DeepPartialArray<T> extends Array<dp.DeepPartial<T>> {
}

type DeepPartialObject<T> = {
    [P in keyof T]?: dp.DeepPartial<T[P]>;
};

//#endregion

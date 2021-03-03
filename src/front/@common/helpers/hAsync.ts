/**
 * @Creater cmZhou
 * @Desc async helper
 */
import { cError } from '../consts/cError';
import { uFunction } from '../utils/uFunction';
import { uObject } from '../utils/uObject';

export abstract class HAsync<TCustomRunOpt extends dp.Obj = dp.Obj> {
    protected constructor() { }

    protected abstract readonly onRunBegin?: (...p: dp.GetFuncParams<HAsync<TCustomRunOpt>['run']>) => dp.PromiseOrSelf<void>;
    protected abstract readonly onRunEnd?: (status: eAsync.F.Status, ...p: dp.GetFuncParams<HAsync<TCustomRunOpt>['run']>) => dp.PromiseOrSelf<void>;

    protected readonly map: dp.Obj<dp.Obj<{
        status: eAsync.F.Status,
        task: Promise<unknown>,
    } | undefined>> = {};

    public readonly keys = {
        GLOBAL_UNIQUE: Symbol('GLOBAL_UNIQUE'),
    };

    protected readonly getNowState = (promiseKey: symbol, key?: symbol) => {
        const strKey = key as unknown as string;
        const strPromiseKey = promiseKey as unknown as string;
        if (strKey) {
            const obj = this.map[strKey][strPromiseKey];
            if (obj) {
                if (obj.status === eAsync.F.Status.Running) {
                    return eAsync.F.Status.Running;
                } else if (obj.status === eAsync.F.Status.BeHided) {
                    return eAsync.F.Status.BeHided;
                }
            }
            return eAsync.F.Status.BeBreaked;
        }
        return eAsync.F.Status.Running;
    }

    public readonly run = async <T = void>(task: dp.PromiseFunc<unknown[], T> | Promise<T>, opt: Options & Partial<TCustomRunOpt> = {}) => {
        const { action = eAsync.F.Action.Break, key, onExecuteSuccess, onExecuteFail, onExecuteEnd } = opt;
        const promiseKey = Symbol();

        const handleStatus = (callback?: Callback, noThrow = false) => {
            const status = this.getNowState(promiseKey, key);

            if (status === eAsync.F.Status.BeBreaked) {
                if (noThrow) return status;
                throw new cError.Noop(`break ${key?.toString() ?? ''} promise`);
            }
            if (status === eAsync.F.Status.Running) {
                callback?.(status);
            }
            return status;
        };

        const promise = uFunction.check(task) ? task() : task;

        const strKey = key as unknown as string;
        const strPromiseKey = promiseKey as unknown as string;

        if (strKey) {
            if (!this.map[strKey]) {
                this.map[strKey] = {};
            }
            Object.getOwnPropertySymbols(this.map[strKey]).forEach(item => {
                const strItem = item as unknown as string;
                const promiseInfo = this.map[strKey][strItem];
                if (promiseInfo) {
                    if (action === eAsync.F.Action.Break) {
                        promiseInfo.status = eAsync.F.Status.BeBreaked;
                    } else if (action === eAsync.F.Action.Hide) {
                        promiseInfo.status = eAsync.F.Status.BeHided;
                    }
                }
            });
            this.map[strKey][strPromiseKey] = {
                status: eAsync.F.Status.Running,
                task: promise,
            };
        }

        try {
            this.onRunBegin && await this.onRunBegin(task, opt);
            const data = await promise;
            handleStatus(onExecuteSuccess);
            return data;
        } catch (e: unknown) {
            if (!uObject.checkInstance(e, cError.Noop)) {
                handleStatus(onExecuteFail);
            }
            throw e;
        } finally {
            const status = handleStatus(onExecuteEnd, true);
            this.onRunEnd && await this.onRunEnd(status, task, opt);
            if (strKey) {
                this.map[strKey][strPromiseKey] = undefined;
            }
        }
    }
}

//#region 私有类型
type Callback = (status: eAsync.F.Status) => void;

type Options = {
    onExecuteSuccess?: Callback,
    onExecuteFail?: Callback,
    onExecuteEnd?: Callback,

    key?: symbol,
    action?: eAsync.F.Action,
};
//#endregion

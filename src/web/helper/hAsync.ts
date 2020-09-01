/**
 * @Creater cmZhou
 * @Desc async helper
 */
import { cError } from '../constant/cError';
import { uFunction } from '../util/uFunction';
import { uObject } from '../util/uObject';

export abstract class HAsync<TCustomRunOpt extends object = {}> {
    protected readonly map: dp.Obj<dp.Obj<{
        status: eAsync.Status;
        task: Promise<any>;
    } | undefined>> = {};

    protected abstract readonly onRunBegin?: (...p: dp.GetFuncParams<HAsync<TCustomRunOpt>['run']>) => dp.PromiseOrSelf<void>;
    protected abstract readonly onRunEnd?: (status: eAsync.Status, ...p: dp.GetFuncParams<HAsync<TCustomRunOpt>['run']>) => dp.PromiseOrSelf<void>;

    public readonly keys = {
        GLOBAL_UNIQUE: Symbol('GLOBAL_UNIQUE')
    };

    protected readonly getNowState = (promiseKey: symbol, key?: symbol) => {
        if (key) {
            const obj = this.map[key as any][promiseKey as any];
            if (obj) {
                if (obj.status === eAsync.Status.Running) {
                    return eAsync.Status.Running;
                } else if (obj.status === eAsync.Status.BeHided) {
                    return eAsync.Status.BeHided;
                }
            }
            return eAsync.Status.BeBreaked;
        }
        return eAsync.Status.Running;
    }

    public readonly run = async <T = void>(task: Promise<T> | dp.PromiseFunc<any[], T>, opt: Options & Partial<TCustomRunOpt> = {}) => {
        const { action = eAsync.Action.Break, key, onExecuteSuccess, onExecuteFail, onExecuteEnd } = opt;
        const promiseKey = Symbol();

        const handleStatus = (callback?: Callback, noThrow = false) => {
            const status = this.getNowState(promiseKey, key);

            if (status === eAsync.Status.BeBreaked) {
                if (noThrow) return status;
                throw new cError.Noop(`break ${key && key.toString()} promise`);
            }
            if (status === eAsync.Status.Running) {
                callback && callback(status);
            }
            return status;
        };

        const promise = uFunction.check(task) ? task() : task;

        if (key) {
            if (!this.map[key as any]) {
                this.map[key as any] = {};
            }
            Object.getOwnPropertySymbols(this.map[key as any]).forEach(item => {
                const promiseInfo = this.map[key as any][item as any];
                if (promiseInfo) {
                    if (action === eAsync.Action.Break) {
                        promiseInfo.status = eAsync.Status.BeBreaked;
                    } else if (action === eAsync.Action.Hide) {
                        promiseInfo.status = eAsync.Status.BeHided;
                    }
                }
            });
            this.map[key as any][promiseKey as any] = {
                status: eAsync.Status.Running,
                task: promise
            };
        }

        try {
            this.onRunBegin && await this.onRunBegin(task, opt);
            const data = await promise;
            handleStatus(onExecuteSuccess);
            return data;
        } catch (e) {
            if (!uObject.checkInstance(e, cError.Noop)) {
                handleStatus(onExecuteFail);
            }
            throw e;
        } finally {
            const status = handleStatus(onExecuteEnd, true);
            this.onRunEnd && await this.onRunEnd(status, task, opt);
            if (key) {
                this.map[key as any][promiseKey as any] = undefined;
            }
        }
    }
}

//#region 私有类型
type Callback = (status: eAsync.Status) => void;

type Options = {
    onExecuteSuccess?: Callback;
    onExecuteFail?: Callback;
    onExecuteEnd?: Callback;

    key?: symbol;
    action?: eAsync.Action;
};
//#endregion

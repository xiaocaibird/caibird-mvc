/**
 * @Creater cmZhou
 * @Desc redux helper
 */
import { cloneDeep } from 'lodash';
import moment from 'moment';
import Redux, { combineReducers, createStore } from 'redux';

import { uObject } from '../../util/uObject';
import { uStorage } from '../../util/uStorage';

import defaultActions from './action';

export abstract class HRedux<TActions extends dRedux.BaseActions = {}> {
    public static readonly createReducer = <K extends keyof dStore.State, TActionsType>(
        opt: { handlers: dRedux.ReducerHandlers<dRedux.DefaultActions & TActionsType, dStore.State[K]>; defaultState: dStore.State[K] }) => ({
            handlers: opt.handlers,
            defaultState: cloneDeep(opt.defaultState)
        })

    constructor(protected readonly options: {
        actions: dRedux.TransformActions<TActions>;
        reducers: dRedux.Reducers<dRedux.DefaultActions & TActions>;
        storageKey: string;
    }) {
        this.action = { ...options.actions, ...defaultActions };
    }
    protected store?: Redux.Store<dStore.State>;
    protected defaultStoreState: Partial<dStore.State> = {};

    public readonly action: dRedux.TransformActions<dRedux.DefaultActions & TActions>;

    public get Store() {
        if (!this.store) {
            this.store = this.storeCreater();
        }
        return this.store;
    }
    public get State() {
        return this.Store.getState();
    }

    protected readonly storeCreater = (initState?: Redux.PreloadedState<dStore.State>) => {
        const reducers = Object.keys(this.options.reducers).reduce<any>((obj, item) => {
            // tslint:disable-next-line: no-unsafe-any
            obj[item] = this.getReducer((this.options.reducers as any)[item]);

            // tslint:disable-next-line: no-unsafe-any
            (this.defaultStoreState as any)[item] = (this.options.reducers as any)[item].defaultState;

            return obj;
        }, {});
        // tslint:disable-next-line: no-unsafe-any
        const Reducer = combineReducers<dStore.State>(reducers);

        const params: [typeof Reducer, typeof initState] = [Reducer] as any;

        if (initState) {
            params.push(initState);
        }

        if (process.env.IS_LOCAL_TEST) {
            // tslint:disable-next-line: no-unsafe-any
            params.push((window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());
        }

        return createStore(...params);
    }

    protected readonly getReducer = <T>({ defaultState, handlers }: { defaultState: T; handlers: dp.Obj<Function | undefined> }) =>
        (state = cloneDeep(defaultState), actionResult: { type: string; payload: any }) => {
            const handler = handlers[actionResult.type];
            if (handler) {
                return handler(state, actionResult.payload);
            }
            return state;
        }

    protected readonly checkRefreshState = (lastUnloadTime: number, minHour = 240) => {
        const lastUnloadDate = moment(new Date(lastUnloadTime));
        const nowDate = moment(new Date());

        if (nowDate.add(-minHour, 'h').isAfter(lastUnloadDate)) return true;
        return false;
    }

    public readonly dispatch = <T extends dRedux.ActionResult<dRedux.DefaultActions & TActions>[keyof dRedux.ActionResult<dRedux.DefaultActions & TActions>]>(actionResult: T) => {
        this.Store.dispatch(actionResult);
    }

    public readonly record = () => {
        uStorage.setValue(this.options.storageKey,
            JSON.stringify(
                {
                    lastUnloadTime: Date.now(),
                    state: this.State
                }
            )
        );
    }

    public readonly reset = () => {
        uStorage.remove(this.options.storageKey);
        this.dispatch((this.action.reset as any)());
    }

    public readonly recover = async (opt: {
        stateExpireHours?: number;
        onBefore?(stateInfo: StorageStateInfo): dp.PromiseOrSelf<boolean>;
    } = {}) => {
        const { onBefore, stateExpireHours = eDate.DayCount.OneYear * eDate.Per.HourPerDay } = opt;
        window.onunload = () => {
            this.record();
        };
        const lastUnLoadInfoStr = uStorage.getValue(this.options.storageKey);
        if (lastUnLoadInfoStr) {
            const lastUnLoadInfo = uObject.jsonParse<StorageStateInfo>(lastUnLoadInfoStr);

            if (lastUnLoadInfo && lastUnLoadInfo.state) {
                const defaultStoreState = cloneDeep(this.defaultStoreState);

                Object.keys(defaultStoreState).forEach(key => {
                    lastUnLoadInfo.state = {
                        ...lastUnLoadInfo.state,
                        [key]: {
                            ...(defaultStoreState as any)[key],
                            ...(lastUnLoadInfo.state as any)[key]
                        }
                    };
                });

                if (lastUnLoadInfo.lastUnloadTime && !this.checkRefreshState(lastUnLoadInfo.lastUnloadTime, stateExpireHours)) {
                    if (!onBefore || await onBefore(lastUnLoadInfo)) {
                        this.dispatch((this.action.recover as any)(lastUnLoadInfo.state));
                    }
                }
            }
        }
    }
}

type StorageStateInfo = {
    state: dStore.State;
    lastUnloadTime: number;
};

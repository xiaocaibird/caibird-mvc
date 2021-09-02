/**
 * @Owners cmZhou
 * @Title redux helper
 */
import { cloneDeep } from 'lodash';
import Redux, { combineReducers, createStore } from 'redux';

import type { dRedux } from '../@types/declares';

export abstract class HRedux<TState, TActions extends dRedux.BaseActions, TRequiredActions extends dRedux.BaseActions | never> {
    public static readonly createReducer = <TStatePart, TActionsType, TRequiredActionsType>(
        opt: { handlers: dRedux.ReducerHandlers<TActionsType, TRequiredActionsType, TStatePart>, defaultState: TStatePart },
    ) => ({
        handlers: opt.handlers,
        defaultState: cloneDeep(opt.defaultState),
    });

    public static readonly combineActions = <TPre extends string, T extends dRedux.BaseCombineActions<string>>(pre: TPre, actions: T) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newActions = Object.keys(actions).reduce<Caibird.dp.Obj<any>>((obj, key) => {
            const k = key as keyof T;
            obj[`${pre}${k.toString()}`] = (...p: Parameters<T[typeof k]>) => {
                const result = actions[k](...p);
                result.type = `${pre}${result.type}`;
                return result;
            };
            return obj;
        }, {});

        return newActions as dRedux.CombineActions<TPre, T>;
    };

    protected constructor(protected readonly options: {
        actions: dRedux.StandardActions<TActions>,
        reducers: dRedux.Reducers<TActions, TRequiredActions, TState>,
    }) {
        this.action = { ...options.actions };
    }

    public get Store() {
        if (!this.store) {
            this.store = this.storeCreater();
        }
        return this.store;
    }

    public get State() {
        return this.Store.getState();
    }

    public get lastState() {
        return this._lastState;
    }

    protected store?: Redux.Store<TState>;
    protected defaultStoreState: Partial<TState> = {};
    protected _lastState = this.Store.getState();

    public readonly action: dRedux.StandardActions<TActions>;

    protected initReducer<TS>(reducer: dRedux.Reducer<TActions, TRequiredActions, TS>) {
        if ('handlers' in reducer) {
            return (state = cloneDeep(reducer.defaultState), actionResult: { type: string, payload: unknown }) => {
                const handler = reducer.handlers[actionResult.type];
                if (handler) {
                    return (handler as Caibird.dp.Func)(state, actionResult.payload);
                }
                return state;
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reducers = Object.keys(reducer.children).reduce<Redux.ReducersMapObject<any, { type: string, payload: unknown }>>((obj, item) => {
            const k = item as keyof typeof reducer.children;
            obj[k] = this.initReducer(reducer.children[k]);
            return obj;
        }, {});

        return combineReducers<TS>(reducers);
    }

    protected getDefaultState<TS>(reducer: dRedux.Reducer<TActions, TRequiredActions, TS>) {
        if ('handlers' in reducer) {
            return reducer.defaultState;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = Object.keys(reducer.children).reduce<Caibird.dp.Obj<any>>((obj, k) => {
            obj[k] = this.getDefaultState(reducer.children[k as keyof typeof reducer.children]);
            return obj;
        }, {});

        return state;
    }

    protected storeCreater(initState?: Redux.PreloadedState<TState>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reducers = combineReducers<TState>(Object.keys(this.options.reducers).reduce<Redux.ReducersMapObject<any, { type: string, payload: unknown }>>((obj, item) => {
            const k = item as keyof TState;
            obj[k] = this.initReducer(this.options.reducers[k]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.defaultStoreState[k] = this.getDefaultState(this.options.reducers[k]) as any;

            return obj;
        }, {}));

        return createStore(reducers, initState, Caibird.env.IS_LOCAL_TEST && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : undefined);
    }

    public readonly dispatch = <T extends dRedux.ActionResult<TActions>[keyof dRedux.ActionResult<TActions>]>(actionResult: T) => {
        this.Store.dispatch(actionResult);
        this._lastState = this.Store.getState();
    };
}

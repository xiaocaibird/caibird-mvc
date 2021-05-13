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

    protected storeCreater(initState?: Redux.PreloadedState<TState>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reducers = Object.keys(this.options.reducers).reduce<Redux.ReducersMapObject<any, { type: string, payload: unknown }>>((obj, item) => {
            const k = item as keyof TState;
            obj[k] = this.getReducer(this.options.reducers[k]);

            this.defaultStoreState[k] = this.options.reducers[k].defaultState;

            return obj;
        }, {});
        const Reducer = combineReducers<TState>(reducers);

        return createStore(Reducer, initState, Caibird.env.IS_LOCAL_TEST && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : undefined);
    }

    protected getReducer<T>({ defaultState, handlers }: { defaultState: T, handlers: Caibird.dp.Obj<Caibird.dp.Func | undefined> }) {
        return (state = cloneDeep(defaultState), actionResult: { type: string, payload: unknown }) => {
            const handler = handlers[actionResult.type];
            if (handler) {
                return handler(state, actionResult.payload) as T;
            }
            return state;
        };
    }

    public readonly dispatch = <T extends dRedux.ActionResult<TActions>[keyof dRedux.ActionResult<TActions>]>(actionResult: T) => {
        this.Store.dispatch(actionResult);
        this._lastState = this.Store.getState();
    };
}

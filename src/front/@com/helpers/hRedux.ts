/**
 * @Owners cmZhou
 * @Title redux helper
 */
import { cloneDeep } from 'lodash';
import Redux, { combineReducers, createStore } from 'redux';

export declare namespace ReduxDeclare {
    type BaseActions = Caibird.dp.Obj<Caibird.dp.Func>;

    type TransformActions<TActions extends BaseActions> = {
        [K in keyof TActions]:
        TActions[K] extends (payload?: infer Value) => unknown ?
        (payload?: Value extends Caibird.dp.Obj | boolean | number | string | symbol ? Value : undefined) => ActionResult<TActions>[K] :
        TActions[K] extends (payload: infer Value) => unknown ?
        (payload: Value) => ActionResult<TActions>[K] : never;
    };

    type ActionResult<TActions extends BaseActions> = {
        [K in keyof ActionReturn<TActions>]: ActionReturn<TActions>[K] extends { type: string, payload: unknown } ?
        { type: K, payload: ActionReturn<TActions>[K]['payload'] } :
        { type: K }
    };

    type Reducers<TActions, TState> = {
        [K in keyof TState]: {
            defaultState: TState[K],
            handlers: ReducerHandlers<TActions, TState[K]>,
        }
    };
    type ReducerHandlers<TActions, TStatePart> = {
        [K in keyof TActions]?: ReducerHandler<TActions, TStatePart, K>;
    };
}

type ActionReturn<TActions extends ReduxDeclare.BaseActions> = {
    [K in keyof TActions]: ReturnType<TActions[K]>;
};
type ReducerHandler<TActions, S, K extends keyof TActions> = GetActionValue<TActions, K> extends never | undefined ? (state: S) => S : (state: S, payload: GetActionValue<TActions, K>) => S;
type GetActionValue<TActions, K extends keyof TActions> = TActions[K] extends (payload: infer V) => unknown ? V : TActions[K] extends () => unknown ? never : never;

export abstract class HRedux<TState, TActions extends ReduxDeclare.BaseActions = ReduxDeclare.BaseActions> {
    public static readonly createReducer = <TStatePart, TActionsType>(
        opt: { handlers: ReduxDeclare.ReducerHandlers<TActionsType, TStatePart>, defaultState: TStatePart },
    ) => ({
        handlers: opt.handlers,
        defaultState: cloneDeep(opt.defaultState),
    });

    protected constructor(protected readonly options: {
        actions: ReduxDeclare.TransformActions<TActions>,
        reducers: ReduxDeclare.Reducers<TActions, TState>,
        storageKey: string,
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

    public readonly action: ReduxDeclare.TransformActions<TActions>;

    protected storeCreater(initState?: Redux.PreloadedState<TState>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reducers = Object.keys(this.options.reducers).reduce<Redux.ReducersMapObject<any, { type: string, payload: unknown }>>((obj, item) => {
            const k = item as keyof TState;
            obj[k] = this.getReducer(this.options.reducers[k]);

            this.defaultStoreState[k] = this.options.reducers[k].defaultState;

            return obj;
        }, {});
        const Reducer = combineReducers<TState>(reducers);

        return createStore(Reducer, initState, CaibirdEnv.IS_LOCAL_TEST && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : undefined);
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

    public readonly dispatch = <T extends ReduxDeclare.ActionResult<TActions>[keyof ReduxDeclare.ActionResult<TActions>]>(actionResult: T) => {
        this.Store.dispatch(actionResult);
        this._lastState = this.Store.getState();
    };
}

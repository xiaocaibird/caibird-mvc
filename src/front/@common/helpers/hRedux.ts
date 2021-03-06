/**
 * @Owners cmZhou
 * @Title redux helper
 */
import { cloneDeep } from 'lodash';
import Redux, { combineReducers, createStore } from 'redux';

export abstract class HRedux<TState extends dp.Obj, TActions extends dRedux.BaseActions = dRedux.BaseActions> {
    public static readonly createReducer = <TStatePart, TActionsType>(
        opt: { handlers: dRedux.ReducerHandlers<TActionsType, TStatePart>, defaultState: TStatePart },
    ) => ({
        handlers: opt.handlers,
        defaultState: cloneDeep(opt.defaultState),
    });

    protected constructor(protected readonly options: {
        actions: dRedux.TransformActions<TActions>,
        reducers: dRedux.Reducers<TActions, TState>,
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

    public readonly action: dRedux.TransformActions<TActions>;

    protected storeCreater(initState?: Redux.PreloadedState<TState>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reducers = Object.keys(this.options.reducers).reduce<Redux.ReducersMapObject<any, { type: string, payload: unknown }>>((obj, item) => {
            const k = item as keyof TState;
            obj[k] = this.getReducer(this.options.reducers[k]);

            this.defaultStoreState[k] = this.options.reducers[k].defaultState;

            return obj;
        }, {});
        const Reducer = combineReducers<TState>(reducers);

        return createStore(Reducer, initState, process.env.IS_LOCAL_TEST && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : undefined);
    }

    protected getReducer<T>({ defaultState, handlers }: { defaultState: T, handlers: dp.Obj<dp.Func | undefined> }) {
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

/**
 * @Creater cmZhou
 * @Desc redux helper
 */
import { cloneDeep } from 'lodash';
import Redux, { combineReducers, createStore } from 'redux';

export abstract class HRedux<TState extends object, TActions extends dRedux.BaseActions = {}> {
    public static readonly createReducer = <TStatePart, TActionsType>(
        opt: { handlers: dRedux.ReducerHandlers<TActionsType, TStatePart>; defaultState: TStatePart }) => ({
            handlers: opt.handlers,
            defaultState: cloneDeep(opt.defaultState)
        })

    constructor(protected readonly options: {
        actions: dRedux.TransformActions<TActions>;
        reducers: dRedux.Reducers<TActions, TState>;
        storageKey: string;
    }) {
        this.action = { ...options.actions };
    }
    protected store?: Redux.Store<TState>;
    protected defaultStoreState: Partial<TState> = {};

    public readonly action: dRedux.TransformActions<TActions>;

    public get Store() {
        if (!this.store) {
            this.store = this.storeCreater();
        }
        return this.store;
    }
    public get State() {
        return this.Store.getState();
    }

    protected readonly storeCreater = (initState?: Redux.PreloadedState<TState>) => {
        const reducers = Object.keys(this.options.reducers).reduce<any>((obj, item) => {
            // tslint:disable-next-line: no-unsafe-any
            obj[item] = this.getReducer((this.options.reducers as any)[item]);

            // tslint:disable-next-line: no-unsafe-any
            (this.defaultStoreState as any)[item] = (this.options.reducers as any)[item].defaultState;

            return obj;
        }, {});
        // tslint:disable-next-line: no-unsafe-any
        const Reducer = combineReducers<TState>(reducers);

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

    public readonly dispatch = <T extends dRedux.ActionResult<TActions>[keyof dRedux.ActionResult<TActions>]>(actionResult: T) => {
        this.Store.dispatch(actionResult);
    }
}

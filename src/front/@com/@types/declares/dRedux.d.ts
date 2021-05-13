/**
 * @Owners cmZhou
 * @Title dRedux
 */
export namespace dRedux {
    type BaseActions = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in string]: (() => { type: K }) | ((payload?: any) => { type: K, payload: any })
    };

    type BaseState = Caibird.dp.Obj<Caibird.dp.Obj>;

    type StandardActions<TActions extends BaseActions> = {
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

    type Reducers<TActions extends BaseActions, TRequiredActions extends BaseActions, TState extends BaseState> = {
        [K in keyof TState]: {
            defaultState: TState[K],
            handlers: ReducerHandlers<TActions, TRequiredActions, TState[K]>,
        }
    };
    type ReducerHandlers<TActions extends BaseActions, TRequiredActions extends BaseActions, TStatePart extends Caibird.dp.Obj> = {
        [K in keyof TActions]?: ReducerHandler<TActions, TStatePart, K>;
    } & {
        [K in keyof TRequiredActions]: ReducerHandler<TRequiredActions, TStatePart, K>;
    };
}

type ActionReturn<TActions extends dRedux.BaseActions> = {
    [K in keyof TActions]: ReturnType<TActions[K]>;
};
type ReducerHandler<TActions extends dRedux.BaseActions, S extends Caibird.dp.Obj, K extends keyof TActions> = GetActionValue<TActions, K> extends never | undefined ? (state: S) => S : (state: S, payload: GetActionValue<TActions, K>) => S;
type GetActionValue<TActions extends dRedux.BaseActions, K extends keyof TActions> = TActions[K] extends (payload: infer V) => unknown ? V : TActions[K] extends () => unknown ? never : never;

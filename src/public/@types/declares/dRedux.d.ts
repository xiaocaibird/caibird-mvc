/**
 * @Creater cmZhou
 * @Desc redux 常用类型
 */
declare global {
    namespace dRedux {
        type BaseActions = dp.Obj<dp.Func>;

        type TransformActions<TActions extends BaseActions> = {
            [K in keyof TActions]:
            TActions[K] extends (payload?: infer Value) => unknown ?
            (payload?: Value extends dp.Obj | boolean | number | string | symbol ? Value : undefined) => ActionResult<TActions>[K] :
            TActions[K] extends (payload: infer Value) => unknown ?
            (payload: Value) => ActionResult<TActions>[K] : never;
        };

        type ActionResult<TActions extends BaseActions> = {
            [K in keyof ActionReturn<TActions>]: ActionReturn<TActions>[K] extends { type: string, payload: unknown } ?
            { type: K, payload: ActionReturn<TActions>[K]['payload'] } :
            { type: K }
        };

        type Reducers<TActions, TState extends dp.Obj> = {
            [K in keyof TState]: {
                defaultState: TState[K],
                handlers: ReducerHandlers<TActions, TState[K]>,
            }
        };
        type ReducerHandlers<TActions, TStatePart> = {
            [K in keyof TActions]?: ReducerHandler<TActions, TStatePart, K>;
        };
    }
}

//#region 私有类型
type ActionReturn<TActions extends dRedux.BaseActions> = {
    [K in keyof TActions]: ReturnType<TActions[K]>;
};
type ReducerHandler<TActions, S, K extends keyof TActions> = GetActionValue<TActions, K> extends never | undefined ? (state: S) => S : (state: S, payload: GetActionValue<TActions, K>) => S;
type GetActionValue<TActions, K extends keyof TActions> = TActions[K] extends (payload: infer V) => unknown ? V : TActions[K] extends () => unknown ? never : never;
//#endregion
export = dRedux;

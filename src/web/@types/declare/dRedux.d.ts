/**
 * @Creater cmZhou
 * @Desc redux 常用类型
 */
declare global {
    namespace dRedux {
        type BaseActions = dp.Obj<dp.Func>;

        type DefaultActions = typeof import('../../helper/hRedux/action').default;

        type TransformActions<TActions extends BaseActions> = {
            [K in keyof TActions]:
            TActions[K] extends (newValue?: infer Value) => any ?
            (newValue?: Value extends object | number | string | boolean | symbol ? Value : undefined) => ActionResult<TActions>[K] :
            TActions[K] extends (newValue: infer Value) => any ?
            (newValue: Value) => ActionResult<TActions>[K] : never;
        };

        type ActionResult<TActions extends BaseActions> = {
            [K in keyof ActionReturn<TActions>]: ActionReturn<TActions>[K] extends { type: string; newValue: any } ?
            { type: K; newValue: ActionReturn<TActions>[K]['newValue'] } :
            { type: K }
        };

        type Reducers<TActions> = {
            [K in keyof dStore.State]: {
                defaultState: dStore.State[K];
                handlers: ReducerHandlers<TActions, dStore.State[K]>;
            }
        };
        type ReducerHandlers<TActions, S extends dStore.State[keyof dStore.State]> = {
            [K in keyof TActions]?: ReducerHandler<TActions, S, K>;
        };
    }
}

//#region 私有类型
type CorrectDefaultActions = dRedux.TransformActions<dRedux.DefaultActions>;
type CheckCorrectDefaultActions<T extends CorrectDefaultActions> = T;
type IsCorrectDefaultActions = CheckCorrectDefaultActions<dRedux.DefaultActions>;

type ActionReturn<TActions extends dRedux.BaseActions> = {
    [K in keyof TActions]: ReturnType<TActions[K]>;
};
type ReducerHandler<TActions, S, K extends keyof TActions> = GetActionValue<TActions, K> extends never | undefined ? (state: S) => S : (state: S, newValue: GetActionValue<TActions, K>) => S;
type GetActionValue<TActions, K extends keyof TActions> = TActions[K] extends (newValue: infer V) => any ? V : TActions[K] extends () => any ? never : never;
//#endregion
export = dRedux;

/**
 * @Owners cmZhou
 * @Title dRedux
 */
export namespace dRedux {
    type BaseActions = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in string]: (() => { type: K }) | ((payload?: any) => { type: K, payload: any })
    };

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

    type Reducer<TActions, TRequiredActions, TStatePart> = {
        children: Reducers<TActions, TRequiredActions, TStatePart>,
    } | {
        defaultState: TStatePart,
        handlers: ReducerHandlers<TActions, TRequiredActions, TStatePart>,
    };

    type Reducers<TActions, TRequiredActions, TState> = {
        [K in keyof TState]: Reducer<TActions, TRequiredActions, TState[K]>
    };

    type ReducerHandlers<TActions, TRequiredActions, TStatePart> = {
        [K in keyof TActions]?: ReducerHandler<TActions, TStatePart, K>;
    } & {
        [K in keyof TRequiredActions]: ReducerHandler<TRequiredActions, TStatePart, K>;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type PrefixAction<K extends string, T extends (payload?: any) => {
        type: string,
    }> =
        T extends () => { type: string, payload?: never } ? () => { type: K } :
        T extends (payload?: infer TPayload) => unknown ? (payload?: TPayload) => { type: K, payload?: TPayload } :
        T extends (payload: infer TPayload) => unknown ? (payload: TPayload) => { type: K, payload: TPayload } :
        never;

    type BaseCombineActions<K extends string> = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [k in K]: (payload?: any) => {
            type: k,
        }
    };

    type CombineActions<TPre extends string, T extends BaseCombineActions<string>> = {
        [k in keyof T as `${TPre}${k & string}`]: PrefixAction<`${TPre}${k & string}`, T[k]>
    };
}

type ActionReturn<TActions extends dRedux.BaseActions> = {
    [K in keyof TActions]: ReturnType<TActions[K]>;
};
type ReducerHandler<TActions, S, K extends keyof TActions> = GetActionValue<TActions, K> extends never | undefined ? (state: S) => S : (state: S, payload: GetActionValue<TActions, K>) => S;
type GetActionValue<TActions, K extends keyof TActions> = TActions[K] extends (payload: infer V) => unknown ? V : TActions[K] extends () => unknown ? never : never;

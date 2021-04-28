/**
 * @Owners cmZhou
 * @Title mvc常用类型
 */
import BaseKoa from 'koa';

export namespace dMvc {
    type BaseCtxState = { fetchId?: string };

    interface BaseCtxCustom<TState> extends BaseKoa.Context {
        state: BaseCtxState & BaseKoa.DefaultState & TState,
    }

    type CtxState<TState> = BaseCtxState & TState;

    type CtxCustom<TState, TCustom> = BaseCtxCustom<TState> & TCustom;

    type Ctx<TState, TCustom> = BaseKoa.ParameterizedContext<CtxState<TState>, CtxCustom<TState, TCustom>>;

    type Koa<TCtxState, TCtxCustom> = BaseKoa<CtxState<TCtxState>, CtxCustom<TCtxState, TCtxCustom>>;

    type Middleware<TCtxState, TCtxCustom> = BaseKoa.Middleware<CtxState<TCtxState>, CtxCustom<TCtxState, TCtxCustom>>;

    type View = typeof import('../../app').default['View'];

    type BaseController<TCtxState, TCtxCustom> = new (ctx: Ctx<TCtxState, TCtxCustom>) => unknown;

    type ControllerProps<TRules, TCtxState, TCtxCustom> = {
        __actions__: Caibird.dp.Obj<Action<TRules, TCtxState, TCtxCustom>>,
    };

    type InitController<TRules, TCtxState, TCtxCustom> = BaseController<TCtxState, TCtxCustom> & Partial<CommonProps<TRules, TCtxState, TCtxCustom> & ControllerProps<TRules, TCtxState, TCtxCustom>>;
    type Controller<TRules, TCtxState, TCtxCustom> = BaseController<TCtxState, TCtxCustom> & CommonProps<TRules, TCtxState, TCtxCustom> & ControllerProps<TRules, TCtxState, TCtxCustom>;

    type BaseAction = Caibird.dp.PromiseFunc;

    type InitAction<TRules, TCtxState, TCtxCustom> = BaseAction & Partial<CommonProps<TRules, TCtxState, TCtxCustom>>;
    type Action<TRules, TCtxState, TCtxCustom> = BaseAction & CommonProps<TRules, TCtxState, TCtxCustom>;

    interface ActionPropertyDescriptor<TRules, TCtxState, TCtxCustom> extends PropertyDescriptor {
        value?: InitAction<TRules, TCtxState, TCtxCustom>,
    }

    type FilterController<TRules, TCtxState, TCtxCustom> = InitController<TRules, TCtxState, TCtxCustom> | InstanceType<InitController<TRules, TCtxState, TCtxCustom>>;
    type Decorator<TRules, TCtxState, TCtxCustom> = (controller: FilterController<TRules, TCtxState, TCtxCustom>, action?: string, actionDes?: ActionPropertyDescriptor<TRules, TCtxState, TCtxCustom>) => void;

    type Filter<TRules, TCtxState, TCtxCustom> = Caibird.dp.Func & FilterProps<TRules, TCtxState, TCtxCustom>;

    type FilterProps<TRules, TCtxState, TCtxCustom> = {
        filterName?: string,
        defaultOrder?: number,
        onCheckRule?(target: Action<TRules, TCtxState, TCtxCustom> | Controller<TRules, TCtxState, TCtxCustom>, options: { controller: string, action: string }, ctx: Ctx<TCtxState, TCtxCustom>): Caibird.dp.PromiseOrSelf<void>,
        preExecute?(target: Action<TRules, TCtxState, TCtxCustom> | Controller<TRules, TCtxState, TCtxCustom>, ctx: Ctx<TCtxState, TCtxCustom>): Caibird.dp.PromiseOrSelf<void>,
        postExecute?(target: Action<TRules, TCtxState, TCtxCustom> | Controller<TRules, TCtxState, TCtxCustom>, ctx: Ctx<TCtxState, TCtxCustom>): Caibird.dp.PromiseOrSelf<void>,
    };

    type CommonProps<TRules, TCtxState, TCtxCustom> = {
        filterOrderList: Caibird.dp.Obj<Filter<TRules, TCtxState, TCtxCustom>[]>,
        filterList: Filter<TRules, TCtxState, TCtxCustom>[],
        filterRules: Partial<TRules> & { httpMethod?: Caibird.eHttp.MethodType | Caibird.eHttp.MethodType[] },
        filterInfo: {
            name?: string,
            desc?: string,
        },
    };
}

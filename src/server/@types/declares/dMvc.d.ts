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

    type Koa<TState, TCustom> = BaseKoa<CtxState<TState>, CtxCustom<TState, TCustom>>;

    type Middleware<TState, TCustom> = BaseKoa.Middleware<CtxState<TState>, CtxCustom<TState, TCustom>>;

    type View = typeof import('../../app').default['View'];

    type BaseController<TState, TCustom> = new (ctx: Ctx<TState, TCustom>) => unknown;

    type ControllerProps<TRules, TState, TCustom> = {
        __actions__: Caibird.dp.Obj<Action<TRules, TState, TCustom>>,
    };

    type InitController<TRules, TState, TCustom> = BaseController<TState, TCustom> & Partial<CommonProps<TRules, TState, TCustom> & ControllerProps<TRules, TState, TCustom>>;
    type Controller<TRules, TState, TCustom> = BaseController<TState, TCustom> & CommonProps<TRules, TState, TCustom> & ControllerProps<TRules, TState, TCustom>;

    type BaseAction = Caibird.dp.PromiseFunc;

    type InitAction<TRules, TState, TCustom> = BaseAction & Partial<CommonProps<TRules, TState, TCustom>>;
    type Action<TRules, TState, TCustom> = BaseAction & CommonProps<TRules, TState, TCustom>;

    interface ActionPropertyDescriptor<TRules, TState, TCustom> extends PropertyDescriptor {
        value?: InitAction<TRules, TState, TCustom>,
    }

    type FilterController<TRules, TState, TCustom> = InitController<TRules, TState, TCustom> | InstanceType<InitController<TRules, TState, TCustom>>;
    type Decorator<TRules, TState, TCustom> = (controller: FilterController<TRules, TState, TCustom>, action?: string, actionDes?: ActionPropertyDescriptor<TRules, TState, TCustom>) => void;

    type Filter<TRules, TState, TCustom> = Caibird.dp.Func & FilterProps<TRules, TState, TCustom>;

    type FilterProps<TRules, TState, TCustom> = {
        filterName?: string,
        defaultOrder?: number,
        onCheckRule?(target: Action<TRules, TState, TCustom> | Controller<TRules, TState, TCustom>, options: { controller: string, action: string }, ctx: Ctx<TState, TCustom>): Caibird.dp.PromiseOrSelf<void>,
        preExecute?(target: Action<TRules, TState, TCustom> | Controller<TRules, TState, TCustom>, ctx: Ctx<TState, TCustom>): Caibird.dp.PromiseOrSelf<void>,
        postExecute?(target: Action<TRules, TState, TCustom> | Controller<TRules, TState, TCustom>, ctx: Ctx<TState, TCustom>): Caibird.dp.PromiseOrSelf<void>,
    };

    type CommonProps<TRules, TState, TCustom> = {
        filterOrderList: Caibird.dp.Obj<Filter<TRules, TState, TCustom>[]>,
        filterList: Filter<TRules, TState, TCustom>[],
        filterRules: Partial<TRules> & { httpMethod?: Caibird.eHttp.MethodType | Caibird.eHttp.MethodType[] },
        filterInfo: {
            name?: string,
            desc?: string,
        },
    };
}

/**
 * @Creater cmZhou
 * @Desc mvc常用类型
 */
import BaseKoa from 'koa';
import KoaSend from 'koa-send';

declare global {
    namespace dMvc {
        type BaseCtxState = { fetchId?: string };

        interface BaseCtxCustom<TState> extends BaseKoa.Context {
            state: TState & BaseCtxState & BaseKoa.DefaultState;
        }

        type CtxState<TState> = TState & BaseCtxState;

        type CtxCustom<TState, TCustom> = TCustom & BaseCtxCustom<TState>;

        type Ctx<TState, TCustom> = BaseKoa.ParameterizedContext<CtxState<TState>, CtxCustom<TState, TCustom>>;

        type Koa<TState, TCustom> = BaseKoa<CtxState<TState>, CtxCustom<TState, TCustom>>;

        type Middleware<TState, TCustom> = BaseKoa.Middleware<CtxState<TState>, CtxCustom<TState, TCustom>>;

        type ActionReq<T extends object> = Partial<T>;

        type BaseController<TState, TCustom> = new (ctx: Ctx<TState, TCustom>) => object;

        type ControllerProps<TRules, TState, TCustom> = {
            actions: dp.Obj<Action<TRules, TState, TCustom>>;
        };

        type InitController<TRules, TState, TCustom> = Partial<CommonProps<TRules, TState, TCustom> & ControllerProps<TRules, TState, TCustom>> & BaseController<TState, TCustom>;
        type Controller<TRules, TState, TCustom> = CommonProps<TRules, TState, TCustom> & ControllerProps<TRules, TState, TCustom> & BaseController<TState, TCustom>;

        type BaseAction = dp.PromiseFunc;

        type InitAction<TRules, TState, TCustom> = Partial<CommonProps<TRules, TState, TCustom>> & BaseAction;
        type Action<TRules, TState, TCustom> = CommonProps<TRules, TState, TCustom> & BaseAction;

        interface ActionPropertyDescriptor<TRules, TState, TCustom> extends PropertyDescriptor {
            value?: InitAction<TRules, TState, TCustom>;
        }

        type FilterController<TRules, TState, TCustom> = InitController<TRules, TState, TCustom> | InstanceType<InitController<TRules, TState, TCustom>>;
        type Decorator<TRules, TState, TCustom> = (controller: FilterController<TRules, TState, TCustom>, action?: string, actionDes?: ActionPropertyDescriptor<TRules, TState, TCustom>) => void;

        type Filter<TRules, TState, TCustom> = Function & FilterProps<TRules, TState, TCustom>;

        type FilterProps<TRules, TState, TCustom> = {
            filterName?: string;
            defaultOrder?: number;
            onCheckRule?(target: Action<TRules, TState, TCustom> | Controller<TRules, TState, TCustom>, options: { controller: string; action: string }, ctx: Ctx<TState, TCustom>): dp.PromiseOrSelf<void>;
            preExecute?(target: Action<TRules, TState, TCustom> | Controller<TRules, TState, TCustom>, ctx: Ctx<TState, TCustom>): dp.PromiseOrSelf<void>;
            postExecute?(target: Action<TRules, TState, TCustom> | Controller<TRules, TState, TCustom>, ctx: Ctx<TState, TCustom>): dp.PromiseOrSelf<void>;
        };

        type CommonProps<TRules, TState, TCustom> = {
            filterOrderList: dp.Obj<Filter<TRules, TState, TCustom>[]>;
            filterList: Filter<TRules, TState, TCustom>[];
            filterRules: { httpMethod?: eHttp.MethodType[] | eHttp.MethodType } & Partial<TRules>;
            filterInfo: {
                name?: string;
                desc?: string;
            };
        };

        type ActionReturn<T> = {
            type: 'json' | 'xml' | 'redirect' | 'file' | 'render' | 'buffer';
            result: T;
        };

        interface JsonActionReturn<T extends object | null> extends ActionReturn<dFetch.SuccessJsonBody<T>> {
            type: 'json';
        }

        interface FileActionReturn extends ActionReturn<{
            path: string;
            opt?: KoaSend.SendOptions;
        }> {
            type: 'file';
        }

        interface RenderActionReturn<T extends object | undefined> extends ActionReturn<{
            view: string;
            params?: T;
        }> {
            type: 'render';
        }

        interface BufferActionReturn extends ActionReturn<{
            buffer: Buffer;
            fileName: string;
            opt?: { type: eHttp.ContentDispositionType };
        }> {
            type: 'buffer';
        }

        interface RedirectActionReturn extends ActionReturn<{
            url: string;
        }> {
            type: 'redirect';
        }

        interface XmlActionReturn extends ActionReturn<{
            xmlStr: string;
        }> {
            type: 'xml';
        }
    }
}
export = dMvc;

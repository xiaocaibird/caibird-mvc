/**
 * @Creater cmZhou
 * @Desc server app
 */
import http from 'http';
import jaegerClient from 'jaeger-client';
import Koa, { Middleware } from 'koa';
import koaBody from 'koa-body';
import KoaRouter from 'koa-router';
import type KoaSend from 'koa-send';
import koaViews from 'koa-views';
import { orderBy } from 'lodash';
import Sequelize from 'sequelize';

import { cError } from '../consts/cError';
import { cKey } from '../consts/cKey';
import { uArray } from '../utils/uArray';
import { uFunction } from '../utils/uFunction';
import { uNumber } from '../utils/uNumber';
import { uObject } from '../utils/uObject';
import { uString } from '../utils/uString';
import { uUuid } from '../utils/uUuid';

import { contextHelper, reportHelper, responseHelper, settingHelper } from './helpers';

export default class App<TRules extends dp.Obj, TState extends dp.Obj, TCustom extends dp.Obj, TControllerDefaultConfig extends dp.Obj | undefined> {
    public static readonly staticHelpers = {
        report: {
            ...reportHelper,
        },
        setting: {
            ...settingHelper,
        },
    } as const;

    public constructor(public readonly options: Options<TRules, TState, TCustom, TControllerDefaultConfig>) {
        reportHelper.init(this.options.reportInitOpt);
    }

    private readonly tracer = this.options.tracingConfig && jaegerClient.initTracer(this.options.tracingConfig, this.options.tracingOptions ?? {});

    private readonly baseController = this.createBaseController();

    private readonly defaultFilters = {
        descriptionFilter: this.filterCreater(
            'descriptionFilter',
            (target, option: string | { name: string, desc: string } = '') => {
                if (uString.check(option)) {
                    target.filterInfo.name = option;
                } else {
                    target.filterInfo.name = option.name;
                    target.filterInfo.desc = option.desc;
                }
            },
        ),
        httpMethodFilter: this.filterCreater(
            'httpMethodFilter',
            (target, method: eHttp.MethodType | eHttp.MethodType[] = []) => {
                target.filterRules.httpMethod = method;
            },
            {
                defaultOrder: Number.MAX_SAFE_INTEGER,
                onCheckRule: (target, _opt, ctx) => {
                    if (target.filterRules.httpMethod) {
                        const method = ctx.method.toUpperCase();
                        const allowMethod = target.filterRules.httpMethod;
                        if (uArray.check(allowMethod)) {
                            if (!allowMethod.map(item => item.toUpperCase()).includes(method)) throw new cError.Status(eHttp.StatusCode.NotFound);
                        } else if (method !== allowMethod) {
                            throw new cError.Status(eHttp.StatusCode.NotFound);
                        }
                    }
                },
            },
        ),
    } as const;

    public readonly koa = new Koa<dMvc.S.CtxState<TState>, dMvc.S.CtxCustom<TState, TCustom>>();

    public readonly server = http.createServer(this.koa.callback());

    public readonly apiMap: dp.Obj<dMvc.S.Controller<TRules, TState, TCustom>> = {};

    public readonly helpers = {
        mvc: {
            baseController: this.baseController,
            defaultFilters: this.defaultFilters,
            getControllerName: this.getControllerName.bind(this),
            getActionName: this.getActionName.bind(this),
            filterCreater: this.filterCreater.bind(this),
        },
        context: {
            get: () => contextHelper.get<TState, TCustom>(),
            getOrNull: () => contextHelper.getOrNull<TState, TCustom>(),
            addTamp: contextHelper.addTamp,
        },
    } as const;

    private createBaseController() {
        const defaultConfig = this.options.controllerDefaultConfig as TControllerDefaultConfig;

        const View = {
            Json: <TData extends dp.Obj | null = null, TOther extends Omit<dFetch.JsonBody, 'code' | 'version'> | undefined = undefined>(data: TData = (null as unknown as TData), other?: TOther): dMvc.S.JsonActionReturn<TData> => ({
                type: 'json',
                result: {
                    code: eFetch.JsonSuccessCode.Success,
                    data,
                    ...other,
                },
            }),
            File: (path: string, opt?: KoaSend.SendOptions): dMvc.S.FileActionReturn => ({
                type: 'file',
                result: {
                    path,
                    opt,
                },
            }),
            Buffer: (buffer: Buffer, fileName: string, opt?: { type: eHttp.ContentDispositionType }): dMvc.S.BufferActionReturn => ({
                type: 'buffer',
                result: {
                    buffer,
                    fileName,
                    opt,
                },
            }),
            Redirect: (url: string): dMvc.S.RedirectActionReturn => ({
                type: 'redirect',
                result: {
                    url,
                },
            }),
            Render: <T extends dp.Obj | undefined = undefined>(view: string, params?: T): dMvc.S.RenderActionReturn<T> => ({
                type: 'render',
                result: {
                    view,
                    params,
                },
            }),
            Xml: (xmlStr: string): dMvc.S.XmlActionReturn => ({
                type: 'xml',
                result: {
                    xmlStr,
                },
            }),
        } as const;

        return class baseController {
            public constructor(
                protected readonly ctx: dMvc.S.Ctx<TState, TCustom>,
            ) { }

            protected readonly defaultConfig = defaultConfig;
            protected readonly View = View;
        };
    }

    private readonly initFilter = <T extends dMvc.S.FilterController<TRules, TState, TCustom>>(
        controller: T,
        filter: dMvc.S.Filter<TRules, TState, TCustom>,
        actionDes?: dMvc.S.ActionPropertyDescriptor<TRules, TState, TCustom>,
        order = filter.defaultOrder ?? 0) => {
        let target;
        let isController = false;
        if (uFunction.check<dMvc.S.InitController<TRules, TState, TCustom>>(controller)) {
            target = controller;
            isController = true;
        } else {
            target = actionDes?.value || null;
        }

        if (!target) {
            throw new Error('initFilter: target not found!');
        }
        if (actionDes) {
            actionDes.writable = false;
        }

        const ACtrl = Object.getPrototypeOf(target) as dp.Func & Partial<dMvc.S.CommonProps<TRules, TState, TCustom>>;

        if (isController && Function.prototype !== ACtrl && target.filterInfo === ACtrl.filterInfo || !target.filterInfo) {
            target.filterInfo = {};
        }

        if (isController && Function.prototype !== ACtrl && target.filterList === ACtrl.filterList || !target.filterList) {
            target.filterList = [];
        }

        if (isController && Function.prototype !== ACtrl && target.filterRules === ACtrl.filterRules || !target.filterRules) {
            target.filterRules = {};
        }

        if (isController && Function.prototype !== ACtrl && target.filterOrderList === ACtrl.filterOrderList || !target.filterOrderList) {
            target.filterOrderList = {};
        }
        if (!target.filterOrderList[order]) {
            target.filterOrderList[order] = [];
        }

        if (target.filterList.includes(filter)) {
            throw new Error(`initFilter: ${filter.name} has exist!`);
        }
        target.filterList.push(filter);
        target.filterOrderList[order].push(filter);

        return target as T extends dp.Func ? dMvc.S.BaseController<TState, TCustom> & dMvc.S.CommonProps<TRules, TState, TCustom> & dMvc.S.ControllerProps<TRules, TState, TCustom> : dMvc.S.BaseAction & dMvc.S.CommonProps<TRules, TState, TCustom>;
    };

    private readonly initController = (startOpt: StartOpt<TRules, TState, TCustom>) => {
        const { controllers, defaultFilters = [] } = startOpt;

        const baseController: dp.Class & Partial<dMvc.S.CommonProps<TRules, TState, TCustom>> = this.baseController;

        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        const setClass: dp.Class & Partial<dMvc.S.CommonProps<TRules, TState, TCustom>> = class SetClass { };
        defaultFilters.forEach(filter => filter(setClass));

        for (const target of Object.values(controllers)) {
            const controller = target as dMvc.S.InitController<TRules, TState, TCustom>;

            if (!uFunction.checkExtendsClass(controller, baseController)) {
                throw new Error(`${(controller as unknown as dp.Class).name} controller 没有继承 baseController！`);
            }

            const AController = Object.getPrototypeOf(target) as dp.Class & Partial<dMvc.S.CommonProps<TRules, TState, TCustom>>;

            if (!controller.filterList) {
                controller.filterList = [];
            }
            if (!controller.filterOrderList) {
                controller.filterOrderList = {};
            }
            if (!controller.filterInfo) {
                controller.filterInfo = {};
            }
            if (AController.filterOrderList) {
                for (const order in AController.filterOrderList) {
                    for (const filter of Object.values(AController.filterOrderList[order])) {
                        if (!controller.filterList.includes(filter)) {
                            controller.filterList.push(filter);
                            if (!controller.filterOrderList[order]) {
                                controller.filterOrderList[order] = [];
                            }
                            controller.filterOrderList[order].push(filter);
                        }
                    }
                }
            }

            if (setClass.filterOrderList) {
                for (const order in setClass.filterOrderList) {
                    for (const filter of Object.values(setClass.filterOrderList[order])) {
                        if (!controller.filterList.includes(filter)) {
                            controller.filterList.push(filter);
                            if (!controller.filterOrderList[order]) {
                                controller.filterOrderList[order] = [];
                            }
                            controller.filterOrderList[order].push(filter);
                        }
                    }
                }
            }

            // eslint-disable-next-line prefer-object-spread
            controller.filterRules = Object.assign({}, setClass.filterRules, AController.filterRules, controller.filterRules);

            const controllerName = controller.name;
            const key = this.getControllerName(controllerName);

            if (this.apiMap[key]) {
                throw new Error(`${controllerName}: 存在相同名称的controller。注：controller名不区分大小写。`);
            }

            controller.__actions__ = {};
            const actions = controller.__actions__;

            for (const action of Object.getOwnPropertyNames(controller.prototype)) {
                if (action === 'constructor') continue;
                const actionKey = this.getActionName(action);
                if (actions[actionKey]) {
                    throw new Error(`${controllerName}下有相同名称的action。注：action名不区分大小写。`);
                }

                const actionFunc = (controller.prototype as dp.Obj<dMvc.S.InitAction<TRules, TState, TCustom>>)[action];
                if (!actionFunc.filterRules) actionFunc.filterRules = {};
                if (!actionFunc.filterOrderList) actionFunc.filterOrderList = {};
                if (!actionFunc.filterList) actionFunc.filterList = [];
                if (!actionFunc.filterInfo) actionFunc.filterInfo = {};
                actions[actionKey] = actionFunc as dMvc.S.Action<TRules, TState, TCustom>;
            }

            this.apiMap[key] = controller as dMvc.S.Controller<TRules, TState, TCustom>;
        }
    };

    private readonly onCheckRules = async (controller: dMvc.S.Controller<TRules, TState, TCustom>, action: dMvc.S.Action<TRules, TState, TCustom>) => {
        const controllerFilterOrderList = controller.filterOrderList;
        const actionFilterOrderList = action.filterOrderList;
        const actionFilterList = action.filterList;

        const cOrderKeys = orderBy(Object.keys(controllerFilterOrderList)).reverse();
        for (const key of cOrderKeys) {
            const filters = controllerFilterOrderList[key] || [];
            for (const filter of filters) {
                if (!actionFilterList.includes(filter) && filter.onCheckRule) {
                    contextHelper.addTamp(`C_/${controller.name}/${action.name}_${filter.filterName || filter.name}_begin`);
                    await filter.onCheckRule(controller, { controller: controller.name, action: action.name }, contextHelper.get());
                    contextHelper.addTamp(`C_/${controller.name}/${action.name}_${filter.filterName || filter.name}_end`);
                }
            }
        }

        const aOrderKeys = orderBy(Object.keys(actionFilterOrderList)).reverse();
        for (const key of aOrderKeys) {
            const filters = actionFilterOrderList[key] || [];
            for (const filter of filters) {
                if (filter.onCheckRule) {
                    contextHelper.addTamp(`A_/${controller.name}/${action.name}_${filter.filterName || filter.name}_begin`);
                    await filter.onCheckRule(action, { controller: controller.name, action: action.name }, contextHelper.get());
                    contextHelper.addTamp(`A_/${controller.name}/${action.name}_${filter.filterName || filter.name}_end`);
                }
            }
        }
    };

    private readonly onExecute = async (target: dMvc.S.Action<TRules, TState, TCustom> | dMvc.S.Controller<TRules, TState, TCustom>, executeType: eMvc.S.FilterExecuteType) => {
        const filterOrderList = target.filterOrderList;
        const orderKeys = orderBy(Object.keys(filterOrderList)).reverse();
        for (const key of orderKeys) {
            const filters = filterOrderList[key] || [];
            for (const filter of filters) {
                if (executeType === eMvc.S.FilterExecuteType.Pre) {
                    filter.preExecute && await filter.preExecute(target, contextHelper.get());
                } else {
                    filter.postExecute && await filter.postExecute(target, contextHelper.get());
                }
            }
        }
    };

    private readonly listenError = () => {
        const {
            disableAllDefaultErrorHandler,
            disableDefaultAppErrorHandler,
            disableDefaultUnhandledRejectionHandler,
            disableDefaultUncaughtExceptionHandler,
            onAppError,
            uncaughtException,
            unhandledRejection,
        } = this.options;
        process.on('unhandledRejection', (reason, promise) => {
            try {
                !(disableAllDefaultErrorHandler || disableDefaultUnhandledRejectionHandler) && reportHelper.appError({
                    key: 'process_unhandledRejection',
                    error: reason ?? undefined,
                });

                unhandledRejection?.(reason, promise, this);
            } catch (e: unknown) {
                console.error('unhandledRejection:', e);
            }
        });
        process.on('uncaughtException', err => {
            try {
                !(disableAllDefaultErrorHandler || disableDefaultUncaughtExceptionHandler) && reportHelper.appError({
                    key: 'process_uncaughtException',
                    msg: err?.message,
                    error: err,
                });

                uncaughtException?.(err, this);
            } catch (e: unknown) {
                console.error('uncaughtException:', e);
            }
        });

        this.koa.on('error', (err: Error, ctx: dMvc.S.Ctx<TState, TCustom>) => {
            try {
                if (!(disableAllDefaultErrorHandler || disableDefaultAppErrorHandler)) {
                    contextHelper.run(ctx, () => {
                        // ctx有时为空
                        if (ctx) {
                            responseHelper.status(eHttp.StatusCode.ServerError, 'Server Error', ctx);
                        }
                        reportHelper.appError({
                            key: 'app_error',
                            msg: err?.message,
                            error: err,
                        }, ctx);
                    });
                }

                onAppError?.(err, ctx, this);
            } catch (e: unknown) {
                console.error('app error:', e);
            }
        });
    };

    private readonly init = (startOpt: StartOpt<TRules, TState, TCustom>) => {
        const { disableDefaultTimestamp } = this.options;
        if (disableDefaultTimestamp) {
            contextHelper.disableDefaultTimestamp();
        }
        this.initController(startOpt);
    };

    private readonly defaultOnRequestError = (error: Error | InstanceType<typeof cError.Base>) => {
        const key = 'defaultOnRequestError';
        try {
            if (uObject.checkInstance(error, cError.Base)) {
                const { info, logOptions } = error;
                if (uNumber.check(info)) {
                    responseHelper.status(info);
                } else if ('status' in info) {
                    responseHelper.status(info.status, info.msg);
                } else {
                    responseHelper.json(info);
                }

                reportHelper.log(
                    {
                        ...logOptions,
                        key: logOptions.key || key,
                        msg: logOptions.msg || key,
                        type: logOptions.type ?? eReport.LogType.Error,
                        source: error,
                    },
                );
            } else if (uObject.checkInstance(error, Sequelize.Error)) {
                responseHelper.json({ code: eFetch.JsonErrorCode.DbError, msg: error.message });
                reportHelper.dbError({
                    key: key + '_db',
                    msg: error.message,
                    error,
                    attribute: true,
                    always: true,
                });
            } else {
                const err = (error || new Error()) as Error;

                responseHelper.status(eHttp.StatusCode.ServerError, err.message);
                reportHelper.unknownError({
                    key: key + '_unknown',
                    msg: err.message,
                    error: err,
                });
            }
        } catch (e: unknown) {
            const err = (e || new Error()) as Error;
            responseHelper.status(eHttp.StatusCode.ServerError, err.message);
            reportHelper.unknownError({
                key: key + '_error',
                msg: err.message,
                error: err,
                details: error,
            });
        }
    };

    private readonly entryMiddleware: dMvc.S.Middleware<TState, TCustom> = async (ctx, next) => {
        const { disableDefalutLog, onRequestBegin, onRequestEnd, onRequestError, disableAllDefaultErrorHandler, disableDefaultRequestErrorHandler, tracingPathIgnore = [] } = this.options;

        ctx.state.fetchId = uUuid.get();
        const tracingIgnore = tracingPathIgnore.map(item => item.trim().toLowerCase());

        return contextHelper.run(ctx, async () => {
            const span = this.tracer && !tracingIgnore.includes(ctx.path.trim().toLowerCase()) ? this.tracer.startSpan(ctx.path) : null;
            const beginDate = Date.now();

            try {
                span?.log({ event: 'fetchId', value: ctx.state.fetchId });

                !disableDefalutLog && reportHelper.beginLog({ key: 'request_entry_begin' });
                contextHelper.addTamp('entry_begin');

                const UUID = ctx.cookies.get(cKey.cookie.UUID);
                if (!UUID) {
                    const newUuid = uUuid.get();
                    ctx.cookies.set(cKey.cookie.UUID, newUuid, { expires: new Date(Date.now() + eDate.MsCount.Chiliad), signed: false, httpOnly: false });
                    span?.log({ event: 'uuid', value: newUuid });
                } else {
                    span?.log({ event: 'uuid', value: UUID });
                }

                const isHttps = ctx.get('x-forwarded-proto') === 'https' || ctx.protocol === 'https';

                if (process.env.IS_LOCAL_TEST || this.options.allowHttp || isHttps) {
                    onRequestBegin && await onRequestBegin(ctx, next, this);
                    await next();
                    onRequestEnd && await onRequestEnd(ctx, next, this);
                } else {
                    throw new cError.Status({ msg: '请使用https访问', status: eHttp.StatusCode.NotFound }, { key: 'https_only' });
                }
            } catch (e: unknown) {
                const err = (e || new Error()) as Error;
                onRequestError && await onRequestError(err, ctx, this);
                !(disableAllDefaultErrorHandler || disableDefaultRequestErrorHandler) && this.defaultOnRequestError(err);
            } finally {
                contextHelper.addTamp('entry_end');
                !disableDefalutLog && reportHelper.endLog({ key: 'request_entry_end', details: { tamp: contextHelper.getTamp(), timespan: Date.now() - beginDate } });
                span?.finish();
            }
        });
    };

    private readonly lastMiddleware: dMvc.S.Middleware<TState, TCustom> = () => {
        throw new cError.Status(eHttp.StatusCode.NotFound);
    };

    private readonly getRoutes = () => {
        const {
            prefix,
            defaultController = 'index',
            defaultAction = 'index',
            formRequestKey = cKey.query.FORM_REQUEST,
        } = this.options;
        const router = new KoaRouter<dMvc.S.CtxState<TState>, dMvc.S.CtxCustom<TState, TCustom>>({
            prefix,
        });
        router.all('/:controller?/:action?/:value*', async (ctx, next) => {
            const { controller = defaultController, action = defaultAction } = ctx.params as { controller?: string, action?: string };

            const controllerName = this.getControllerName(controller);
            const Controller = this.apiMap[controllerName];

            if (!Controller) {
                await next();
                return;
            }

            const controllerObj = new Controller(ctx);
            const actionName = this.getActionName(action);
            const Action: dMvc.S.Action<TRules, TState, TCustom> | undefined = Controller.__actions__[actionName];

            if (!Action) {
                await next();
                return;
            }

            contextHelper.addTamp('checkRules_begin');
            await this.onCheckRules(Controller, Action);
            contextHelper.addTamp('checkRules_end');

            await this.onExecute(Controller, eMvc.S.FilterExecuteType.Pre);
            await this.onExecute(Action, eMvc.S.FilterExecuteType.Pre);

            contextHelper.addTamp(`${controllerName}_${actionName}_begin`);

            let formParams: dp.Obj | null = null;

            const body = ctx.request.body as dp.Obj;

            if (body[formRequestKey]) {
                formParams = uObject.parseJson(body[formRequestKey] as string);
            }

            const actionReturn = await Action.bind(controllerObj)({ ...ctx.query, ...body, ...formParams }) as dMvc.S.BufferActionReturn | dMvc.S.FileActionReturn | dMvc.S.JsonActionReturn<dp.Obj> | dMvc.S.RedirectActionReturn | dMvc.S.RenderActionReturn<dp.Obj> | dMvc.S.XmlActionReturn | null | undefined;

            contextHelper.addTamp(`${controllerName}_${actionName}_end`);

            await this.onExecute(Action, eMvc.S.FilterExecuteType.Post);
            await this.onExecute(Controller, eMvc.S.FilterExecuteType.Post);

            if (actionReturn == null) {
                throw new cError.Status(
                    { status: eHttp.StatusCode.ServerError, msg: 'Router Return Error' },
                    { key: `router_${controller}_${action}_actionReturn_null` },
                );
            }

            switch (actionReturn.type) {
                case 'json':
                    responseHelper.json(actionReturn.result);
                    break;
                case 'redirect':
                    ctx.redirect(actionReturn.result.url);
                    break;
                case 'file':
                    await responseHelper.file(actionReturn.result.path, actionReturn.result.opt);
                    break;
                case 'render':
                    await responseHelper.render(actionReturn.result.view, actionReturn.result.params);
                    break;
                case 'buffer':
                    responseHelper.buffer(actionReturn.result.buffer, actionReturn.result.fileName, actionReturn.result.opt);
                    break;
                case 'xml':
                    responseHelper.xml(actionReturn.result.xmlStr);
                    break;
                default:
                    throw new cError.Status(
                        { status: eHttp.StatusCode.ServerError, msg: 'Router Return Error' },
                        { key: `router_${controller}_${action}_actionReturn_typeError`, details: actionReturn },
                    );
            }
        });

        return router.routes();
    };

    private readonly use = async () => {
        const {
            bodyOptions,
            onPreUseKoaBody,
            onPreUseMvc,
            onPostUseMvc,
            renderConfig,
        } = this.options;

        this.koa.use(this.entryMiddleware);
        if (renderConfig) {
            responseHelper.setInitRender();
            this.koa.use(koaViews(renderConfig.dir, renderConfig.opt) as Middleware);
        }
        onPreUseKoaBody && await onPreUseKoaBody(this.koa, this);
        this.koa.use(koaBody({ strict: false, ...bodyOptions }));
        onPreUseMvc && await onPreUseMvc(this.koa, this);
        this.koa.use(this.getRoutes());
        onPostUseMvc && await onPostUseMvc(this.koa, this);
        this.koa.use(this.lastMiddleware);
    };

    private getControllerName(controller: string) { return controller.toLowerCase(); }
    private getActionName(action: string) { return action.toLowerCase(); }

    private filterCreater<TOption = undefined>(
        name: string,
        handler: (target: dMvc.S.CommonProps<TRules, TState, TCustom> & dp.Func, option?: TOption) => void,
        props?: Omit<dMvc.S.FilterProps<TRules, TState, TCustom>, 'filterName'>,
    ) {
        const filter = (option?: TOption, order = 0): dMvc.S.Decorator<TRules, TState, TCustom> =>
            (controller, _action, actionDes) => {
                handler(this.initFilter(controller, filter, actionDes, order), option);
            };
        Object.assign(filter, props, { filterName: name });
        return filter;
    }

    public readonly start = async (startOpt: StartOpt<TRules, TState, TCustom>) => {
        const { host, port, appKeys, onPreInit, onPostInit, onEnd } = this.options;
        this.koa.keys = appKeys;
        this.listenError();
        onPreInit && await onPreInit(this);
        this.init(startOpt);
        onPostInit && await onPostInit(this);
        await this.use();
        onEnd && await onEnd(this);
        // this.koa.listen(port, host, () => console.log(`server run: http://${host}:${port}`));
        this.server.listen(port, host, () => console.log(`server run: http://${host}:${port}`));
    };
}

type Options<TRules extends dp.Obj, TState extends dp.Obj, TCustom extends dp.Obj, TControllerDefaultConfig extends dp.Obj | undefined> = (TControllerDefaultConfig extends undefined ? { controllerDefaultConfig?: undefined } : { controllerDefaultConfig: TControllerDefaultConfig }) & {
    host: string,
    port: number,
    appKeys: string[],

    prefix?: string,
    allowHttp?: boolean,
    defaultController?: string,
    defaultAction?: string,
    formRequestKey?: string,

    reportInitOpt?: dReport.InitOptions,

    tracingConfig?: jaegerClient.TracingConfig,
    tracingOptions?: jaegerClient.TracingOptions,
    tracingPathIgnore?: string[],

    disableDefaultTimestamp?: boolean,
    disableDefalutLog?: boolean,

    disableAllDefaultErrorHandler?: boolean,
    disableDefaultRequestErrorHandler?: boolean,
    disableDefaultAppErrorHandler?: boolean,
    disableDefaultUnhandledRejectionHandler?: boolean,
    disableDefaultUncaughtExceptionHandler?: boolean,

    bodyOptions?: koaBody.IKoaBodyOptions,
    renderConfig?: {
        dir: string,
        opt?: dp.GetFuncParams<typeof koaViews>[1],
    },

    onPreUseKoaBody?(koa: dMvc.S.Koa<TState, TCustom>, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,
    onPreUseMvc?(koa: dMvc.S.Koa<TState, TCustom>, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,
    onPostUseMvc?(koa: dMvc.S.Koa<TState, TCustom>, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,

    onPreInit?(app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,
    onPostInit?(app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,
    onEnd?(app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,

    onRequestBegin?(ctx: dMvc.S.Ctx<TState, TCustom>, next: dp.PromiseFunc, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,
    onRequestEnd?(ctx: dMvc.S.Ctx<TState, TCustom>, next: dp.PromiseFunc, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,
    onRequestError?(error: unknown, ctx: dMvc.S.Ctx<TState, TCustom>, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): dp.PromiseOrSelf<void>,

    onAppError?(error: unknown, ctx: dMvc.S.Ctx<TState, TCustom> | null, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): void,
    unhandledRejection?(error: unknown, promise: Promise<unknown>, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): void,
    uncaughtException?(error: Error, app: App<TRules, TState, TCustom, TControllerDefaultConfig>): void,
};

type StartOpt<TRules, TState, TCustom> = {
    controllers: dp.Obj<dp.Class>,
    defaultFilters?: dMvc.S.Decorator<TRules, TState, TCustom>[],
};

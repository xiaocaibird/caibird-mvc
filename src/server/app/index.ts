/**
 * @Owners cmZhou
 * @Title server app
 */
import KoaRouter from '@koa/router';
import http from 'http';
import https from 'https';
import jaegerClient from 'jaeger-client';
import Koa from 'koa';
import koaBody from 'koa-body';
import type KoaSend from 'koa-send';
import koaSession from 'koa-session';
import koaViews from 'koa-views';
import { orderBy } from 'lodash';
import Sequelize from 'sequelize';

import type { dMvc, dReport } from '../@types/declares';
import { eApp } from '../@types/enums';
import { cError } from '../consts/cError';
import { cKey } from '../consts/cKey';
import { uArray } from '../utils/uArray';
import { uFunction } from '../utils/uFunction';
import { uNumber } from '../utils/uNumber';
import { uObject } from '../utils/uObject';
import { uString } from '../utils/uString';
import { uUuid } from '../utils/uUuid';

import { contextHelper, reportHelper, responseHelper, settingHelper } from './helpers';

export default class App<TRules extends Caibird.dp.Obj, TCtxState extends Caibird.dp.Obj, TCtxCustom extends Caibird.dp.Obj, TControllerDefaultConfig extends Caibird.dp.Obj | undefined> {
    public static readonly staticHelpers = {
        report: {
            ...reportHelper,
        },
        setting: {
            ...settingHelper,
        },
    } as const;

    public static readonly View = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Json: <TData extends Caibird.dp.Obj<any> | null = null, TOther extends Omit<Caibird.dFetch.JsonBody, 'code' | 'version'> | undefined = undefined>(data: TData = (null as unknown as TData), other?: TOther): Caibird.dFetch.JsonActionReturn<TData> => ({
            type: 'json',
            result: {
                code: Caibird.eFetch.JsonSuccessCode.Success,
                data,
                ...other,
            },
        }),
        File: (path: string, opt?: KoaSend.SendOptions): Caibird.dFetch.FileActionReturn => ({
            type: 'file',
            result: {
                path,
                opt,
            },
        }),
        Buffer: (buffer: Buffer, fileName: string, opt?: { type: Caibird.eHttp.ContentDispositionType }): Caibird.dFetch.BufferActionReturn => ({
            type: 'buffer',
            result: {
                buffer,
                fileName,
                opt,
            },
        }),
        Redirect: (url: string): Caibird.dFetch.RedirectActionReturn => ({
            type: 'redirect',
            result: {
                url,
            },
        }),
        Render: <T extends Caibird.dp.Obj | undefined = undefined>(view: string, params?: T): Caibird.dFetch.RenderActionReturn<T> => ({
            type: 'render',
            result: {
                view,
                params,
            },
        }),
        Xml: (xmlStr: string): Caibird.dFetch.XmlActionReturn => ({
            type: 'xml',
            result: {
                xmlStr,
            },
        }),
    } as const;

    public constructor(public readonly options: Options<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>) {
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
            (target, method: Caibird.eHttp.MethodType | Caibird.eHttp.MethodType[] = []) => {
                target.filterRules.httpMethod = method;
            },
            {
                defaultOrder: Number.MAX_SAFE_INTEGER,
                onCheckRule: (target, _opt, ctx) => {
                    if (target.filterRules.httpMethod) {
                        const method = ctx.method.toUpperCase();
                        const allowMethod = target.filterRules.httpMethod;
                        if (uArray.check(allowMethod)) {
                            if (!allowMethod.map(item => item.toUpperCase()).includes(method)) throw new cError.Status(Caibird.eHttp.StatusCode.NotFound);
                        } else if (method !== allowMethod) {
                            throw new cError.Status(Caibird.eHttp.StatusCode.NotFound);
                        }
                    }
                },
            },
        ),
    } as const;

    // 之后放到caibrid中的hService中
    public readonly defaultHttpConfigs = {
        timeout: 10000,
        httpAgent: new http.Agent({
            keepAlive: true,
        }),
        httpsAgent: new https.Agent({
            keepAlive: true,
        }),
    };

    public readonly koa = new Koa<dMvc.CtxState<TCtxState>, dMvc.CtxCustom<TCtxState, TCtxCustom>>();

    public readonly server = http.createServer(this.koa.callback());

    public readonly apiMap: Caibird.dp.Obj<dMvc.Controller<TRules, TCtxState, TCtxCustom>> = {};

    public readonly helpers = {
        mvc: {
            baseController: this.baseController,
            defaultFilters: this.defaultFilters,
            getControllerName: this.getControllerName.bind(this),
            getActionName: this.getActionName.bind(this),
            filterCreater: this.filterCreater.bind(this),
            registerController: <T extends Caibird.dp.Class>(controller: T) => {
                this.initController(controller);
                this.registerActions(controller);

                return controller;
            },
        },
        context: {
            get: () => contextHelper.get<TCtxState, TCtxCustom>(),
            getOrNull: () => contextHelper.getOrNull<TCtxState, TCtxCustom>(),
            addTamp: contextHelper.addTamp,
        },
    } as const;

    private createBaseController() {
        const defaultConfig = this.options.controllerDefaultConfig as TControllerDefaultConfig;
        const View = App.View;

        return class baseController {
            // TODO 优化相关逻辑
            public static readonly filterOrderList = {};
            public static readonly filterList = [];
            public static readonly filterRules = {};
            public static readonly filterInfo = {};
            public static readonly __actions__ = {};

            public constructor(
                protected readonly ctx: dMvc.Ctx<TCtxState, TCtxCustom>,
            ) { }

            protected readonly defaultConfig = defaultConfig;
            protected readonly View = View;
        };
    }

    private readonly initFilter = <T extends dMvc.FilterController<TRules, TCtxState, TCtxCustom>>(
        controller: T,
        filter: dMvc.Filter<TRules, TCtxState, TCtxCustom>,
        actionDes?: dMvc.ActionPropertyDescriptor<TRules, TCtxState, TCtxCustom>,
        order = filter.defaultOrder ?? 0) => {
        let target;
        let isController = false;
        if (uFunction.check<dMvc.InitController<TRules, TCtxState, TCtxCustom>>(controller)) {
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

        const ACtrl = Object.getPrototypeOf(target) as Caibird.dp.Func & Partial<dMvc.CommonProps<TRules, TCtxState, TCtxCustom>>;

        // TODO 与initController中的逻辑有重复
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

        return target as T extends Caibird.dp.Func ? dMvc.BaseController<TCtxState, TCtxCustom> & dMvc.CommonProps<TRules, TCtxState, TCtxCustom> & dMvc.ControllerProps<TRules, TCtxState, TCtxCustom> : dMvc.BaseAction & dMvc.CommonProps<TRules, TCtxState, TCtxCustom>;
    };

    private readonly initController = (controller: dMvc.InitController<TRules, TCtxState, TCtxCustom>) => {
        const AController = Object.getPrototypeOf(controller) as Caibird.dp.Class & Partial<dMvc.CommonProps<TRules, TCtxState, TCtxCustom>>;

        if (controller.filterList === AController.filterList || !controller.filterList) {
            controller.filterList = [];
        }
        if (controller.filterInfo === AController.filterInfo || !controller.filterInfo) {
            controller.filterInfo = {};
        }
        if (controller.filterRules === AController.filterRules || !controller.filterRules) {
            controller.filterRules = {};
        }
        if (controller.filterOrderList === AController.filterOrderList || !controller.filterOrderList) {
            controller.filterOrderList = {};
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

        // eslint-disable-next-line prefer-object-spread
        controller.filterRules = Object.assign({}, AController.filterRules, controller.filterRules);

        return controller as dMvc.Controller<TRules, TCtxState, TCtxCustom>;
    };

    private readonly registerActions = <T extends Caibird.dp.Class>(controller: T) => {
        Object.getOwnPropertyNames(controller.prototype).forEach(key => {
            if (key !== 'constructor') {
                Reflect.defineProperty(controller.prototype as Caibird.dp.Obj, key, {
                    enumerable: true,
                });
            }
        });
    };

    private readonly registerControllers = (startOpt: StartOpt<TRules, TCtxState, TCtxCustom>) => {
        const { controllers, defaultFilters = [] } = startOpt;

        const baseController: Caibird.dp.Class & Partial<dMvc.CommonProps<TRules, TCtxState, TCtxCustom>> = this.baseController;

        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        const setClass: Caibird.dp.Class & Partial<dMvc.CommonProps<TRules, TCtxState, TCtxCustom>> = class SetClass { };
        defaultFilters.forEach(filter => filter(setClass));

        for (const target of Object.values(controllers)) {
            const controller = this.initController(target as dMvc.InitController<TRules, TCtxState, TCtxCustom>);

            if (!uFunction.checkExtendsClass(controller, baseController)) {
                throw new Error(`${(controller as unknown as Caibird.dp.Class).name} controller 没有继承 baseController！`);
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
            controller.filterRules = Object.assign({}, setClass.filterRules, controller.filterRules);

            const controllerName = controller.name;
            const key = this.getControllerName(controllerName);

            if (this.apiMap[key]) {
                throw new Error(`${controllerName}: 存在相同名称的controller。注：controller名不区分大小写。`);
            }

            controller.__actions__ = {};
            const actions = controller.__actions__;

            this.registerActions(controller);

            for (const action in controller.prototype as Caibird.dp.Obj) {
                if (action === 'constructor') continue;
                const actionKey = this.getActionName(action);
                if (actions[actionKey]) {
                    throw new Error(`${controllerName}下有相同名称的action。注：action名不区分大小写。`);
                }

                const actionFunc = (controller.prototype as Caibird.dp.Obj<dMvc.InitAction<TRules, TCtxState, TCtxCustom>>)[action];
                if (!actionFunc.filterRules) actionFunc.filterRules = {};
                if (!actionFunc.filterOrderList) actionFunc.filterOrderList = {};
                if (!actionFunc.filterList) actionFunc.filterList = [];
                if (!actionFunc.filterInfo) actionFunc.filterInfo = {};
                actions[actionKey] = actionFunc as dMvc.Action<TRules, TCtxState, TCtxCustom>;
            }

            this.apiMap[key] = controller;
        }
    };

    private readonly onCheckRules = async (controller: dMvc.Controller<TRules, TCtxState, TCtxCustom>, action: dMvc.Action<TRules, TCtxState, TCtxCustom>) => {
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

    private readonly onExecute = async (target: dMvc.Action<TRules, TCtxState, TCtxCustom> | dMvc.Controller<TRules, TCtxState, TCtxCustom>, executeType: eApp.FilterExecuteType) => {
        const filterOrderList = target.filterOrderList;
        const orderKeys = orderBy(Object.keys(filterOrderList)).reverse();
        for (const key of orderKeys) {
            const filters = filterOrderList[key] || [];
            for (const filter of filters) {
                if (executeType === eApp.FilterExecuteType.Pre) {
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
                    error: (reason as Caibird.dp.Obj) ?? undefined,
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

        this.koa.on('error', (err: Error, ctx: dMvc.Ctx<TCtxState, TCtxCustom>) => {
            try {
                if (!(disableAllDefaultErrorHandler || disableDefaultAppErrorHandler)) {
                    contextHelper.run(ctx, () => {
                        // ctx有时为空
                        if (ctx) {
                            responseHelper.status(Caibird.eHttp.StatusCode.ServerError, 'Server Error', ctx);
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

    private readonly init = (startOpt: StartOpt<TRules, TCtxState, TCtxCustom>) => {
        const { disableDefaultTimestamp } = this.options;
        if (disableDefaultTimestamp) {
            contextHelper.disableDefaultTimestamp();
        }
        this.registerControllers(startOpt);
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
                        type: logOptions.type ?? Caibird.eReport.LogType.Error,
                        source: error,
                    },
                );
            } else if (uObject.checkInstance(error, Sequelize.Error)) {
                responseHelper.json({ code: Caibird.eFetch.JsonErrorCode.DbError, msg: error.message });
                reportHelper.dbError({
                    key: `${key}_db`,
                    msg: error.message,
                    error,
                    attribute: true,
                    always: true,
                });
            } else {
                const err = (error || new Error()) as Error;

                responseHelper.status(Caibird.eHttp.StatusCode.ServerError, err.message);
                reportHelper.unknownError({
                    key: `${key}_unknown`,
                    msg: err.message,
                    error: err,
                });
            }
        } catch (e: unknown) {
            const err = (e || new Error()) as Error;
            responseHelper.status(Caibird.eHttp.StatusCode.ServerError, err.message);
            reportHelper.unknownError({
                key: `${key}_error`,
                msg: err.message,
                error: err,
                details: error,
            });
        }
    };

    private readonly entryMiddleware: dMvc.Middleware<TCtxState, TCtxCustom> = async (ctx, next) => {
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
                    ctx.cookies.set(cKey.cookie.UUID, newUuid, { expires: new Date(Date.now() + Caibird.eDate.MsCount.Chiliad), signed: false, httpOnly: false });
                    span?.log({ event: 'uuid', value: newUuid });
                } else {
                    span?.log({ event: 'uuid', value: UUID });
                }

                const isHttps = ctx.get('x-forwarded-proto') === 'https' || ctx.protocol === 'https';

                if (Caibird.env.IS_LOCAL_TEST || this.options.allowHttp || isHttps) {
                    onRequestBegin && await onRequestBegin(ctx, next, this);
                    await next();
                    onRequestEnd && await onRequestEnd(ctx, next, this);
                } else {
                    throw new cError.Status({ msg: '请使用https访问', status: Caibird.eHttp.StatusCode.NotFound }, { key: 'https_only' });
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

    private readonly lastMiddleware: dMvc.Middleware<TCtxState, TCtxCustom> = () => {
        throw new cError.Status(Caibird.eHttp.StatusCode.NotFound);
    };

    private readonly getRoutes = () => {
        const {
            prefix,
            defaultController = 'index',
            defaultAction = 'index',
            formRequestKey = cKey.query.FORM_REQUEST,
        } = this.options;
        const router = new KoaRouter<dMvc.CtxState<TCtxState>, dMvc.CtxCustom<TCtxState, TCtxCustom>>({
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
            const Action: dMvc.Action<TRules, TCtxState, TCtxCustom> | undefined = Controller.__actions__[actionName];

            if (!Action) {
                await next();
                return;
            }

            contextHelper.addTamp('checkRules_begin');
            await this.onCheckRules(Controller, Action);
            contextHelper.addTamp('checkRules_end');

            await this.onExecute(Controller, eApp.FilterExecuteType.Pre);
            await this.onExecute(Action, eApp.FilterExecuteType.Pre);

            contextHelper.addTamp(`${controllerName}_${actionName}_begin`);

            let formParams: Caibird.dp.Obj | null = null;

            const body = ctx.request.body as Caibird.dp.Obj;

            if (body[formRequestKey]) {
                formParams = uObject.parseJson(body[formRequestKey] as string);
            }

            const actionReturn = await Action.bind(controllerObj)({ ...ctx.query, ...body, ...formParams }) as
                Caibird.dFetch.BufferActionReturn |
                Caibird.dFetch.FileActionReturn |
                Caibird.dFetch.JsonActionReturn<Caibird.dp.Obj> |
                Caibird.dFetch.RedirectActionReturn |
                Caibird.dFetch.RenderActionReturn<Caibird.dp.Obj> |
                Caibird.dFetch.XmlActionReturn |
                null | undefined;

            contextHelper.addTamp(`${controllerName}_${actionName}_end`);

            await this.onExecute(Action, eApp.FilterExecuteType.Post);
            await this.onExecute(Controller, eApp.FilterExecuteType.Post);

            if (actionReturn == null) {
                throw new cError.Status(
                    { status: Caibird.eHttp.StatusCode.ServerError, msg: 'Router Return Error' },
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
                        { status: Caibird.eHttp.StatusCode.ServerError, msg: 'Router Return Error' },
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
            sessionOptions,
        } = this.options;

        this.koa.use(this.entryMiddleware);
        if (renderConfig) {
            responseHelper.setInitRender();
            this.koa.use(koaViews(renderConfig.dir, renderConfig.opt));
        }
        onPreUseKoaBody && await onPreUseKoaBody(this.koa, this);
        this.koa.use(koaBody({ strict: false, ...bodyOptions }));
        sessionOptions !== false && this.koa.use(koaSession({
            key: `${Caibird.env.PROJECT_NAME}_session`,
            maxAge: Caibird.eDate.MsCount.OneDay * Caibird.eDate.DayCount.OneYear,
            ...sessionOptions,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, this.koa as any));
        onPreUseMvc && await onPreUseMvc(this.koa, this);
        this.koa.use(this.getRoutes());
        onPostUseMvc && await onPostUseMvc(this.koa, this);
        this.koa.use(this.lastMiddleware);
    };

    private getControllerName(controller: string) { return controller.toLowerCase(); }
    private getActionName(action: string) { return action.toLowerCase(); }

    private filterCreater<TOption = undefined>(
        name: string,
        handler: (target: Caibird.dp.Func & dMvc.CommonProps<TRules, TCtxState, TCtxCustom>, option?: TOption) => void,
        props?: Omit<dMvc.FilterProps<TRules, TCtxState, TCtxCustom>, 'filterName'>,
    ) {
        const filter = (option?: TOption, order?: number): dMvc.Decorator<TRules, TCtxState, TCtxCustom> =>
            (controller, _action, actionDes) => {
                handler(this.initFilter(controller, filter, actionDes, order), option);
            };
        Object.assign(filter, props, { filterName: name });
        return filter;
    }

    public readonly start = async (startOpt: StartOpt<TRules, TCtxState, TCtxCustom>) => {
        const { host, port, appKeys, onPreInit, onPostInit, onEnd, clearCtxTimeout } = this.options;

        clearCtxTimeout != null && contextHelper.setClearTimeout(clearCtxTimeout);

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

type Options<TRules extends Caibird.dp.Obj, TCtxState extends Caibird.dp.Obj, TCtxCustom extends Caibird.dp.Obj, TControllerDefaultConfig extends Caibird.dp.Obj | undefined> = (TControllerDefaultConfig extends undefined ? { controllerDefaultConfig?: undefined } : { controllerDefaultConfig: TControllerDefaultConfig }) & {
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
        opt?: Parameters<typeof koaViews>[1],
    },
    sessionOptions?: koaSession.opts | false,

    clearCtxTimeout?: number,

    onPreUseKoaBody?(koa: dMvc.Koa<TCtxState, TCtxCustom>, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,
    onPreUseMvc?(koa: dMvc.Koa<TCtxState, TCtxCustom>, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,
    onPostUseMvc?(koa: dMvc.Koa<TCtxState, TCtxCustom>, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,

    onPreInit?(app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,
    onPostInit?(app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,
    onEnd?(app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,

    onRequestBegin?(ctx: dMvc.Ctx<TCtxState, TCtxCustom>, next: Caibird.dp.PromiseFunc, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,
    onRequestEnd?(ctx: dMvc.Ctx<TCtxState, TCtxCustom>, next: Caibird.dp.PromiseFunc, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,
    onRequestError?(error: unknown, ctx: dMvc.Ctx<TCtxState, TCtxCustom>, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): Caibird.dp.PromiseOrSelf<void>,

    onAppError?(error: unknown, ctx: dMvc.Ctx<TCtxState, TCtxCustom> | null, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): void,
    unhandledRejection?(error: unknown, promise: Promise<unknown>, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): void,
    uncaughtException?(error: Error, app: App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>): void,
};

type StartOpt<TRules, TCtxState, TCtxCustom> = {
    controllers: Caibird.dp.Obj<Caibird.dp.Class>,
    defaultFilters?: dMvc.Decorator<TRules, TCtxState, TCtxCustom>[],
};

/**
 * @Creater cmZhou
 * @Desc app reportHelper
 */
// tslint:disable no-magic-numbers

import type Koa from 'koa';
import { get } from 'lodash';
import log4js from 'log4js';
import moment from 'moment';

import { cKey } from '../../constant/cKey';
import { uArray } from '../../util/uArray';
import { uNumber } from '../../util/uNumber';
import { uObject } from '../../util/uObject';
import { uString } from '../../util/uString';

import { contextHelper, settingHelper } from '.';

const logTypeNameMap: {
    [k in eReport.LogType]: string;
} = {
    log: 'log',
    error: 'error',
    unknownError: 'unknownError',
    statusError: 'statusError',
    beginLog: 'beginLog',
    endLog: 'endLog',
    dbError: 'dbError',
    dbLog: 'dbLog',
    topError: 'topError',
    appError: 'appError',
    webLog: 'webLog',
    webError: 'webError',
    webTopError: 'webTopError',
    webUnknownError: 'webUnknownError',
    webReactError: 'webReactError',
    other: 'other'
};

class ReportHelper {
    public static readonly instance: ReportHelper = new ReportHelper();
    private constructor() { }

    private readonly logs = new Proxy<any>({}, {
        get: (target: Record<eReport.LogType, log4js.Logger>, key: eReport.LogType) => {
            if (!target[key]) {
                target[key] = log4js.getLogger(key);
            }
            return target[key];
        }
    }) as Readonly<Record<eReport.LogType, log4js.Logger>>;

    private options: dReport.InitOptions = {};

    private readonly handleInfo = (info: any, maxLength = 500, isError = false) => {
        try {
            if (uString.check(info)) {
                if (info.length > 50000) {
                    return {
                        _type_: 'text',
                        _msg_: '【contentSizeIsTooBig】'
                    };
                }

                if (info.length <= maxLength) {
                    const obj = uObject.jsonParse(info);
                    if (obj) return obj;
                }

                return uString.subText({ str: info, maxLength, diffSBC: false });
            } else if (uArray.check(info)) {
                const json = uObject.safeStringify(info);

                if (json.length > maxLength) {
                    return {
                        _type_: 'Array',
                        _msg_: '【contentSizeIsTooBig】'
                    };
                }
                return uObject.jsonParse(json);
            } else if (uObject.check(info) && info) {
                const obj = info as dp.Obj<string | number | dp.Obj | undefined>;

                let result: dp.Obj = {};

                if (isError) {
                    const code = obj.code != null ? uString.subText({ str: obj.code.toString(), maxLength: 100, diffSBC: false }) : undefined;
                    const name = uString.check(obj.name) && uString.subText({ str: obj.name, maxLength: 100, diffSBC: false }) || undefined;
                    const message = uString.check(obj.message) && uString.subText({ str: obj.message, maxLength: 100, diffSBC: false }) || undefined;
                    const stack = uString.check(obj.stack) && uString.subText({ str: obj.stack, maxLength: 1500, diffSBC: false }) || undefined;
                    result = {
                        code,
                        name,
                        message,
                        stack
                    };

                    obj.code = undefined;
                    obj.name = undefined;
                    obj.message = undefined;
                    obj.stack = undefined;
                }

                const json = uObject.safeStringify(obj);
                if (json.length > maxLength) {
                    result = {
                        ...result,
                        _type_: 'Object',
                        _msg_: '【contentSizeIsTooBig】'
                    };
                } else {
                    result = {
                        ...uObject.jsonParse(json),
                        ...result
                    };
                }
                return result;
            } else if (uNumber.check(info)) {
                return info;
            } else if (typeof info === 'boolean') {
                return info;
            }
            return undefined;
        } catch (e) {
            const error = (e || new Error()) as Error;
            return {
                message: error.message,
                _type_: 'Error',
                _msg_: '【handleInfoError】'
            };
        }
    }

    private readonly getLogInfo = (opt: dReport.LogOptions, logStack: string, ctx: Koa.Context | null) => {
        let uuid = '';
        try {
            uuid = ctx && ctx.cookies.get(cKey.cookie.UUID) || '';
        } catch { }

        let ctxInfo: dReport.LogInfo['ctx'] = null;

        try {
            ctxInfo = ctx && {
                header: {
                    request: this.handleInfo(ctx.request.header, 2000),
                    response: this.handleInfo(ctx.response.header, 2000)
                },
                body: {
                    request: (ctx.request.is('json') || ctx.request.is('xml')) && this.handleInfo(ctx.request.body, 2000) || '【otherType】',
                    response: (ctx.response.is('json') || ctx.response.is('xml')) && this.handleInfo(ctx.response.body, 2000) || '【otherType】'
                },
                type: {
                    request: this.handleInfo(ctx.request.type, 100),
                    response: this.handleInfo(ctx.response.type, 100)
                },
                query: this.handleInfo(ctx.query, 1000),
                ips: this.handleInfo(ctx.ips, 500),
                path: this.handleInfo(ctx.request.path, 1000),
                url: this.handleInfo(ctx.request.url, 1000),
                originalUrl: this.handleInfo(ctx.request.originalUrl, 1000),
                session: this.handleInfo(ctx.session, 1000),
                status: this.handleInfo(ctx.status),
                method: this.handleInfo(ctx.method)
            };
        } catch { }

        const date = moment();

        const state = ctx && ctx.state as dp.Obj;

        const logInfo: dReport.LogInfo = {
            type: opt.type || eReport.LogType.Other,
            level: opt.level || 'info',
            key: this.handleInfo(opt.key, 100),
            date: date.format('YYYY-MM-DD'),
            time: date.format('HH:mm:ss:SSS'),
            msg: this.handleInfo(opt.msg, 500),
            uuid: this.handleInfo(uuid, 50),
            fetchId: this.handleInfo(state && state.fetchId || '', 50),
            details: this.handleInfo(opt.details, 4000),
            error: this.handleInfo(opt.error, 1000, true),
            source: this.handleInfo(opt.source, 1000, true),
            logStack: this.handleInfo(logStack, 1500),
            ctx: ctxInfo
        };

        return logInfo;
    }

    public readonly init = (opt: dReport.InitOptions = {}) => {
        this.options = opt;

        const unitSize = 5242880;
        const { maxLogSize = {
            beginLog: unitSize * 2,
            endLog: unitSize * 2,
            dbLog: unitSize * 2,
            statusError: unitSize * 2
        }, projectLogName } = opt;

        const getAppenders = () => {
            const obj: dp.Obj<log4js.FileAppender> = Object.keys(logTypeNameMap).reduce<dp.Obj<log4js.FileAppender>>((result, item) => {
                result[item] = {
                    type: 'file',
                    filename: `log4js/${projectLogName ? projectLogName : 'default'}/${item}.log`,
                    maxLogSize: maxLogSize[item as eReport.LogType] || unitSize,
                    compress: true,
                    keepFileExt: true,
                    layout: { type: 'dummy' }
                };
                return result;
            }, {});

            return obj;
        };

        const getCategories = () => {
            const obj: log4js.Configuration['categories'] = Object.keys(logTypeNameMap).reduce<log4js.Configuration['categories']>((result, item) => {
                result[item] = {
                    appenders: [item],
                    level: 'info',
                    enableCallStack: true
                };
                return result;
            }, {});

            obj.default = {
                appenders: ['log'],
                level: 'info',
                enableCallStack: true
            };

            return obj;
        };

        log4js.configure({
            appenders: getAppenders(),
            categories: getCategories()
        });
    }

    public readonly log = (opt: dReport.LogOptions, ctx = contextHelper.getOrNull()) => {
        if (process.env.IS_LOCAL_TEST) {
            if (opt.type && (opt.type.includes('error') || opt.type.includes('Error'))) {
                console.log(opt);
            }
        }
        try {
            const { alwaysLog, pathIgnoreList = [], pathWhiteList = [], whiteListCtxKeys = [], whiteListCtxValues = [], dbLogPathWhiteListWhenAlways = [] } = this.options;

            let isWriteLog = false;

            if (opt.always) {
                isWriteLog = true;
            } else if (ctx && ctx.path != null) {
                const getList = (list: string[], str: string) => {
                    const settingList = uArray.jsonParseOrEmpty<string[]>(str);
                    return [...list, ...settingList].map(item => item == null ? '' : item.toString().trim().toLowerCase());
                };

                const path = ctx.path.toString().trim().toLowerCase();

                if (alwaysLog) {
                    if (opt.type === eReport.LogType.DbLog) {
                        const dbWhiteList = getList(dbLogPathWhiteListWhenAlways, settingHelper.getCustomConfig('reportDbLogPathWhiteListWhenAlways'));
                        isWriteLog = dbWhiteList.includes(path) ? true : false;
                    } else {
                        const ignoreList = getList(pathIgnoreList, settingHelper.getCustomConfig('reportPathIgnoreList'));
                        isWriteLog = ignoreList.includes(path) ? false : true;
                    }
                } else {
                    const whiteList = getList(pathWhiteList, settingHelper.getCustomConfig('reportPathWhiteList'));
                    isWriteLog = whiteList.includes(path) ? true : false;
                }

                if (!isWriteLog) {
                    const ctxKeys = getList(whiteListCtxKeys, settingHelper.getCustomConfig('reportWhiteListCtxKeys'));

                    const values: string[] = [];

                    ctxKeys.forEach(key => {
                        try {
                            values.push((get(ctx, key) as string).toString().trim().toLowerCase());
                        } catch { }
                    });

                    const ctxValues = getList(whiteListCtxValues, settingHelper.getCustomConfig('reportWhiteListCtxValues'));

                    for (const value of values) {
                        if (ctxValues.includes(value)) {
                            isWriteLog = true;
                            break;
                        }
                    }
                }
            } else {
                isWriteLog = true;
            }

            if (!isWriteLog) return;

            if (opt.type == null) {
                opt.type = eReport.LogType.Log;
            }

            if (!Object.keys(logTypeNameMap).includes(opt.type)) {
                opt.type = eReport.LogType.Other;
            }

            const logger = this.logs[opt.type];

            if (opt.type.includes('error') || opt.type.includes('Error')) {
                opt.level = 'error';
                const logInfo = this.getLogInfo(opt, new LogStack().stack || '', ctx);

                logger.error(uObject.safeStringify(logInfo));
            } else {
                opt.level = 'info';
                const logInfo = this.getLogInfo(opt, new LogStack().stack || '', ctx);
                logger.info(uObject.safeStringify(logInfo));
            }
        } catch (e) {
            console.error('writeLog:', e);
        }
    }

    public readonly beginLog = (opt: Omit<dReport.LogOptions, 'type'>) => this.log({ ...opt, type: eReport.LogType.BeginLog });

    public readonly endLog = (opt: Omit<dReport.LogOptions, 'type'>) => this.log({ ...opt, type: eReport.LogType.EndLog });

    public readonly dbError = (opt: Omit<dReport.LogOptions, 'type'>) => this.log({ ...opt, type: eReport.LogType.DbError });

    public readonly dbLog = (opt: Omit<dReport.LogOptions, 'type'>) => this.log({ ...opt, type: eReport.LogType.DbLog });

    public readonly unknownError = (opt: Omit<dReport.LogOptions, 'type' | 'always' | 'attribute'>, ctx?: Koa.Context | null) =>
        this.log({ ...opt, type: eReport.LogType.UnknownError, always: true, attribute: true }, ctx)

    public readonly appError = (opt: Omit<dReport.LogOptions, 'type' | 'always' | 'attribute'>, ctx?: Koa.Context | null) =>
        this.log({ ...opt, type: eReport.LogType.AppError, always: true, attribute: true }, ctx)
}

//#region 私有成员
class LogStack extends Error {
    public readonly name = 'LogStack';
}
//#endregion

export const reportHelper = ReportHelper.instance;
export default reportHelper;

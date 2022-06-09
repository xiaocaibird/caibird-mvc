/**
 * @Owners cmZhou
 * @Title request helper
 */
import { throttle } from 'lodash';

import { HRequest as base } from '../../@com/helpers/hRequest';
import { dRequest } from '../@types/declares';
import { ePrompt } from '../@types/enums';
import { cError } from '../consts/cError';
import { cKey } from '../consts/cKey';
import { uHttp } from '../utils/uHttp';
import { uObject } from '../utils/uObject';
import { uString } from '../utils/uString';
import { uUuid } from '../utils/uUuid';

export abstract class HRequest<TControllers extends Caibird.dFetch.BaseControllers, TCustomOpt extends Caibird.dp.Obj> extends base {
    protected constructor(protected readonly options: {
        prefix?: string,
        formRequestKey?: string,
        disableVersionCheck?: boolean,
        versionCheckInterval?: number,
        timeout?: number,
        defaultErrorPrompt?: ePrompt.Type,
        defaultErrorPromptStyle?: ePrompt.StyleType,
        defaultRetryTimes?: number,
        errorProbability?: number,
        // TODO 未覆盖整个流程
        defaultFetchOptions?: dRequest.BaseOptions,
    }) {
        super();
    }

    private jsonpIndex = 0;
    private readonly uuid = uUuid.get();

    private readonly onVersionMismatch = throttle(() => {
        throw new cError.VersionMismatch({ msg: '版本不匹配！', key: 'versionMismatch' });
    }, this.options.versionCheckInterval);

    protected abstract readonly onFetchSuccess?: (opt: dRequest.Options & Partial<TCustomOpt>, details: dRequest.FetchInfo, xhr?: XMLHttpRequest) => Caibird.dp.PromiseOrSelf<void>;
    protected abstract readonly onGetResultError?: (error: Caibird.dp.Obj | null, opt: dRequest.Options & Partial<TCustomOpt>, details: dRequest.FetchInfo) => Caibird.dp.PromiseOrSelf<boolean>;
    protected abstract readonly preGetNoHandleResult?: (rsp: Caibird.dFetch.ErrorJsonBody | Caibird.dFetch.SuccessJsonBody<unknown> | null, opt: dRequest.DetailsOptions & Partial<TCustomOpt>, details: dRequest.FetchInfo) => Caibird.dp.PromiseOrSelf<void>;
    protected abstract readonly onGetNoHandleResultError?: (error: unknown, opt: dRequest.DetailsOptions & Partial<TCustomOpt>, details: dRequest.FetchInfo) => Caibird.dp.PromiseOrSelf<void>;

    public readonly api = new Proxy<Caibird.dp.Obj>({}, {
        get: (_target, controllerName) =>
            new Proxy({}, {
                get: (_controller, actionName) =>
                    (req?: Caibird.dp.Obj, opt: dRequest.Options & Partial<TCustomOpt> = {}) => this.handleApi(controllerName.toString(), actionName.toString(), req, opt),
            }),
    }) as dRequest.Api<TControllers, TCustomOpt>;

    private readonly handleApi = (controllerName: string, actionName: string, req?: Caibird.dp.Obj, opt: dRequest.Options & Partial<TCustomOpt> = {}) => {
        const { isFormFetch, noHandle, retryTimes, shouldRetry } = opt;

        const maxRetryTimes = (retryTimes == null ? this.options.defaultRetryTimes : retryTimes) ?? 0;
        let nowRetryTimes = 0;

        const url = `/${controllerName}/${actionName}`;

        if (isFormFetch) {
            this.formFetch(url, req);
            return null;
        }

        if (noHandle) {
            return this.getNoHandleResult(url, req, opt);
        }

        const getResult = async (): Promise<unknown> => {
            try {
                return this.getResult(url, req, opt);
            } catch (e: unknown) {
                if (shouldRetry) {
                    nowRetryTimes++;
                    if (await shouldRetry({
                        error: e,
                        nowRetryTimes,
                    })) {
                        return getResult();
                    }

                    throw e;
                }

                if (nowRetryTimes >= maxRetryTimes) {
                    throw e;
                }

                if (uObject.checkInstance(e, cError.VersionMismatch)) {
                    throw e;
                }

                if (uObject.checkInstance(e, cError.LoginError)) {
                    throw e;
                }

                nowRetryTimes++;

                return getResult();
            }
        };

        return getResult();
    };

    protected readonly jsonpFetch = async <T>(url: string, req: Caibird.dp.Obj, opt: dRequest.Options = {}) => {
        const { timeout = this.options.timeout == null ? Caibird.eDate.MsTimespan.RequestTimeout : this.options.timeout, jsonpCallbackParamName = 'callback', jsonpCallbackFuncName } = opt;

        return new Promise<T>((resolve, reject) => {
            const script = document.createElement('script');
            const funcName = jsonpCallbackFuncName || `_caibird_jsonpcb_${this.uuid}_${this.jsonpIndex++}_`;
            const clear = () => {
                try {
                    script.remove();
                    delete (window as unknown as Caibird.dp.Obj)[funcName];
                    clearTimeout(timeoutId);
                } catch { }
            };
            const timeoutId = setTimeout(() => {
                clear();
                reject({ msg: '请求超时！' });
            }, timeout);

            try {
                req[jsonpCallbackParamName] = funcName;

                script.src = uHttp.urlAddQuery(url, req as Caibird.dp.Obj<Caibird.dp.UrlParams>); // TODO 处理类型断言

                (window as unknown as Caibird.dp.Obj)[funcName] = (data: T) => {
                    clear();
                    resolve(data);
                };

                document.body.append(script);
            } catch (e: unknown) {
                clear();
                reject(e);
            }
        });
    };

    protected readonly getResult = async <T>(url: string, req?: Caibird.dp.Obj | null, opt: dRequest.Options & Partial<TCustomOpt> = {}): Promise<T> => {
        const { disableVersionCheck, defaultErrorPrompt, defaultErrorPromptStyle } = this.options;
        const { type = Caibird.eHttp.MethodType.POST, noReportError, errorPrompt, errorPromptStyle } = opt;

        const nowShowPrompt = errorPrompt == null ? defaultErrorPrompt : errorPrompt;
        const nowPromptStyleType = errorPromptStyle == null ? defaultErrorPromptStyle : errorPromptStyle;

        const defaultMsg = '通信异常！请稍后再试！';
        const info: dRequest.FetchInfo = {
            url,
            req,
            rsp: undefined,
        };
        const key = 'hRequest_getResult_';

        let rsp: Caibird.dFetch.ErrorJsonBody | Caibird.dFetch.SuccessJsonBody<T> | null;
        try {
            rsp = await this.fetchJson<Caibird.dFetch.ErrorJsonBody | Caibird.dFetch.SuccessJsonBody<T> | null>(type, url, req, opt);
            info.rsp = rsp;
        } catch (e: unknown) {
            const error = e as Caibird.dp.Obj;
            if (!(!this.onGetResultError ? true : await this.onGetResultError(error, opt, info))) throw new cError.Noop();

            throw new cError.ApiFetchFail(
                {
                    error,
                    info,
                },
                {
                    key: `${key}fetch_fail`,
                    showPrompt: nowShowPrompt,
                    promptStyleType: nowPromptStyleType,
                    msg: (error && (error['msg'] || error['message']) || defaultMsg) as string,
                },
                noReportError === true ? false : {
                    key: `${key}fetch_fail`,
                    type: Caibird.eReport.LogType.WebTopError,
                    details: info,
                    error,
                    always: true,
                    attribute: true,
                });
        }

        if (rsp?.data !== undefined && rsp.code === Caibird.eFetch.JsonSuccessCode.Success) {
            return rsp.data;
        }
        if (!(!this.onGetResultError ? true : await this.onGetResultError(null, opt, info))) throw new cError.Noop();

        if (!rsp) {
            throw new cError.ApiJsonResultEmpty(
                {
                    info,
                },
                {
                    key: `${key}rsp_empty`,
                    showPrompt: nowShowPrompt,
                    promptStyleType: nowPromptStyleType,
                    msg: defaultMsg,
                }, noReportError === true ? false : {
                    key: `${key}rsp_empty`,
                    type: Caibird.eReport.LogType.WebTopError,
                    details: info,
                    always: true,
                    attribute: true,
                });
        }

        if (!disableVersionCheck && rsp.version && rsp.version !== Caibird.env.PROJECT_VERSION) {
            this.onVersionMismatch();
        }

        const code = rsp.code;

        if (code === Caibird.eFetch.JsonErrorCode.NoLogin ||
            code === Caibird.eFetch.JsonErrorCode.LoginInvalid ||
            code === Caibird.eFetch.JsonErrorCode.LoginExpired ||
            code === Caibird.eFetch.JsonErrorCode.IllegalLoginUser
        ) {
            throw new cError.LoginError(
                {
                    rsp,
                    info,
                },
                {
                    key: `${key}login_error`,
                    msg: rsp.msg || '请登录！',
                });
        }

        throw new cError.ApiJsonResultError(
            {
                rsp,
                info,
            },
            {
                key: `${key}api_error`,
                showPrompt: nowShowPrompt,
                promptStyleType: nowPromptStyleType,
                msg: rsp.msg,
            });
    };

    protected readonly getNoHandleResult = async <T>(url: string, req?: Caibird.dp.Obj | null, opt: dRequest.DetailsOptions & Partial<TCustomOpt> = {}) => {
        const { type = Caibird.eHttp.MethodType.POST, checkLoginWhenNoHandle } = opt;

        const defaultMsg = '通信异常！请稍后再试！';
        const info: dRequest.FetchInfo = {
            url,
            req,
            rsp: null,
        };
        const key = 'hRequest_getNoHandleResult_';

        let rsp: Caibird.dFetch.ErrorJsonBody | Caibird.dFetch.SuccessJsonBody<T>;
        try {
            rsp = await this.fetchJson<Caibird.dFetch.ErrorJsonBody | Caibird.dFetch.SuccessJsonBody<T>>(type, url, req, opt);
            info.rsp = rsp;
        } catch (e: unknown) {
            const error = e as Caibird.dp.Obj;
            this.onGetNoHandleResultError && await this.onGetNoHandleResultError(error, opt, info);

            const msg = error && (error['msg'] || error['message']) || defaultMsg;
            return {
                code: Caibird.eFetch.JsonErrorCode.FetchError,
                msg,
            };
        }

        const code = rsp.code;

        this.preGetNoHandleResult && await this.preGetNoHandleResult(rsp, opt, info);

        if (checkLoginWhenNoHandle) {
            if (code === Caibird.eFetch.JsonErrorCode.NoLogin ||
                code === Caibird.eFetch.JsonErrorCode.LoginInvalid ||
                code === Caibird.eFetch.JsonErrorCode.LoginExpired ||
                code === Caibird.eFetch.JsonErrorCode.IllegalLoginUser
            ) {
                throw new cError.LoginError(
                    {
                        rsp,
                        info,
                    },
                    {
                        key: `${key}login_error`,
                        msg: rsp.msg || '请登录！',
                    });
            }
        }

        return {
            ...rsp,
            data: rsp.data,
        };
    };

    public readonly fetchJson = async <T>(type: Caibird.eHttp.MethodType, url: string, req?: unknown, opt: dRequest.Options & Partial<TCustomOpt> = {}) => {
        let data;
        let xhr;

        if (opt.isJsonpFetch) {
            const reqObj = uString.check(req) ? uHttp.parseUrl(req) : req;
            data = await this.jsonpFetch<T>(url, reqObj as Caibird.dp.Obj || {}, opt); // TODO 处理类型断言
        } else {
            xhr = await this.fetch(type, url, req, opt);

            data = uObject.parseJson<T>(xhr.responseText);
        }
        this.onFetchSuccess && await this.onFetchSuccess(opt, { url, req, rsp: data }, xhr);

        if (data) {
            return data;
        }
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw {
            xhr,
            response: xhr && {
                responseText: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText,
            },
            request: {
                type,
                url,
                req,
                opt,
            },
            msg: '网络异常！请稍后再试',
        }; // TODO
    };

    public readonly getLocalUrl = (url: string) => (this.options.prefix ?? '') + url;

    public readonly fetch = async (type: Caibird.eHttp.MethodType, oriUrl: string, req?: unknown, opt: dRequest.Options = {}) => {
        let url = oriUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = this.getLocalUrl(url);
        }

        const sendData = req ?? {};

        const dftHeaders = typeof this.options.defaultFetchOptions?.headers === 'function' ? await this.options.defaultFetchOptions.headers() : this.options.defaultFetchOptions?.headers;
        const optHeaders = typeof opt.headers === 'function' ? await opt.headers() : opt.headers;
        const headers = {
            ...dftHeaders,
            ...optHeaders,
        };

        const p = new Promise<XMLHttpRequest>((resolve, reject) => {
            const { timeout = this.options.timeout == null ? Caibird.eDate.MsTimespan.RequestTimeout : this.options.timeout,
                contentType, withCredentials, requestedWith = Caibird.eHttp.RequestedWith.XMLHttpRequest } = {
                ...this.options.defaultFetchOptions,
                ...opt,
            };
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'text';
            if (withCredentials !== undefined) {
                xhr.withCredentials = withCredentials;
            }

            const timeoutId = setTimeout(() => {
                reject({ msg: '请求超时！' });
                xhr.abort();
            }, timeout);

            const readyState = 4;
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== readyState) {
                    return;
                }
                resolve(xhr);
                clearTimeout(timeoutId);
            };

            if (uString.equalIC(type, Caibird.eHttp.MethodType.GET)) {
                xhr.open(type, uHttp.urlAddQuery(url, sendData as Caibird.dp.Obj<Caibird.dp.UrlParams>), true); // TODO 处理类型断言
                Object.keys(headers).forEach(k => {
                    if (headers[k] != null) xhr.setRequestHeader(k, headers[k]);
                });
                xhr.send(undefined);
            } else {
                xhr.open(type, url, true);
                Object.keys(headers).forEach(k => {
                    if (headers[k] != null) xhr.setRequestHeader(k, headers[k]);
                });
                if (requestedWith !== null) xhr.setRequestHeader('x-requested-with', requestedWith);
                if (typeof FormData !== 'undefined' && uObject.checkInstance(sendData, FormData)) {
                    contentType && xhr.setRequestHeader('Content-Type', contentType);
                    xhr.send(sendData);
                } else {
                    if (contentType === Caibird.eHttp.ContentType.JSON || contentType === undefined) {
                        xhr.setRequestHeader('Content-Type', Caibird.eHttp.ContentType.JSON);
                        xhr.send(JSON.stringify(sendData));
                    } else if (contentType === Caibird.eHttp.ContentType.FORM) {
                        xhr.setRequestHeader('Content-Type', Caibird.eHttp.ContentType.FORM);
                        xhr.send(uString.check(sendData) ? sendData : uHttp.stringifyQuery(sendData as Caibird.dp.Nullable<Caibird.dp.Obj<Caibird.dp.UrlParams>>)); // TODO 处理类型断言
                    } else {
                        xhr.send(JSON.stringify(sendData));
                    }
                }
            }
        });

        return p;
    };

    public readonly formFetch = (url: string, req?: Caibird.dp.Obj, opt: dRequest.Options = {}) => {
        const { formRequestKey = cKey.query.FORM_REQUEST } = this.options;
        const { type = Caibird.eHttp.MethodType.POST } = opt;

        const iframe = document.createElement('iframe');
        iframe.setAttribute('style', 'display:none;');

        const form = document.createElement('form');
        form.method = type;
        form.action = url;

        const input = document.createElement('input');
        input.name = formRequestKey;
        input.value = req && JSON.stringify(req) || '';

        document.body.appendChild(iframe);
        form.appendChild(input);
        iframe.appendChild(form);

        form.submit();

        input.remove();
        form.remove();
        iframe.remove();
    };
}

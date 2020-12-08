/**
 * @Creater cmZhou
 * @Desc request helper
 */
import { throttle } from 'lodash';

import cError from '../constant/cError';
import cKey from '../constant/cKey';
import { uHttp } from '../util/uHttp';
import { uObject } from '../util/uObject';
import { uString } from '../util/uString';

export abstract class HRequest<TControllers extends dFetch.BaseControllers, TCustomOpt extends {}> {
    constructor(protected readonly options: {
        prefix?: string;
        formRequestKey?: string;
        disableVersionCheck?: boolean;
        versionCheckInterval?: number;
        timeout?: number;
        defaultErrorPrompt?: ePrompt.Type;
        defaultErrorPromptStyle?: ePrompt.StyleType;
        defaultRetryTimes?: number;
        errorProbability?: number;
    }) { }

    private jsonpIndex = 0;

    private readonly onVersionMismatch = throttle(() => {
        throw new cError.VersionMismatch({ msg: '版本不匹配！', key: 'versionMismatch' });
    }, this.options.versionCheckInterval);

    protected abstract readonly onFetchSuccess?: (opt: dRequest.Options & Partial<TCustomOpt>, details: dRequest.FetchInfo, xhr?: XMLHttpRequest) => dp.PromiseOrSelf<void>;
    protected abstract readonly onGetResultError?: (error: object | null, opt: dRequest.Options & Partial<TCustomOpt>, details: dRequest.FetchInfo) => dp.PromiseOrSelf<boolean>;
    protected abstract readonly preGetNoHandleResult?: (rsp: dFetch.SuccessJsonBody<any> | dFetch.ErrorJsonBody | null, opt: dRequest.DetailsOptions & Partial<TCustomOpt>, details: dRequest.FetchInfo) => dp.PromiseOrSelf<void>;
    protected abstract readonly onGetNoHandleResultError?: (error: any, opt: dRequest.DetailsOptions & Partial<TCustomOpt>, details: dRequest.FetchInfo) => dp.PromiseOrSelf<void>;

    public readonly api = new Proxy<any>({}, {
        get: (_target, controllerName) =>
            new Proxy({}, {
                get: (_controller, actionName) =>
                    (req?: dp.Obj, opt: dRequest.Options & Partial<TCustomOpt> = {}) => this.handleApi(controllerName.toString(), actionName.toString(), req, opt)
            })
    }) as dRequest.BaseApi<TControllers, TCustomOpt>;

    private readonly handleApi = (controllerName: string, actionName: string, req?: dp.Obj, opt: dRequest.Options & Partial<TCustomOpt> = {}) => {
        const { isFormFetch, noHandle, retryTimes, shouldRetry } = opt;

        const maxRetryTimes = (retryTimes == null ? this.options.defaultRetryTimes : retryTimes) || 0;
        let nowRetryTimes = 0;

        const url = `/${controllerName}/${actionName}`;

        if (isFormFetch) {
            this.formFetch(url, req);
            return null;
        }

        if (noHandle) {
            return this.getNoHandleResult(url, req, opt);
        }

        const getResult = async (): Promise<any> => {
            try {
                return this.getResult(url, req, opt);
            } catch (e) {
                if (shouldRetry) {
                    nowRetryTimes++;
                    if (await shouldRetry({
                        error: e,
                        nowRetryTimes
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
    }

    protected readonly jsonpFetch = <T>(url: string, req: dp.Obj, opt: dRequest.Options = {}) => {
        const { timeout = this.options.timeout == null ? eDate.MsTimespan.RequestTimeout : this.options.timeout, jsonpCallbackParamName = 'callback', jsonpCallbackFuncName } = opt;

        return new Promise<T>((resolve, reject) => {
            const script = document.createElement('script');
            const funcName = jsonpCallbackFuncName || `_caibird_jsonpcb${this.jsonpIndex++}_`;
            const clear = () => {
                script.remove();
                delete (window as any)[funcName];
            };

            req[jsonpCallbackParamName] = funcName;
            try {
                script.src = uHttp.urlAddQuery(url, req);

                (window as any)[funcName] = (data: any) => {
                    clear();
                    resolve(data as T);
                };

                setTimeout(() => {
                    clear();
                    reject({ msg: '请求超时！' });
                }, timeout);

                document.body.append(script);
            } catch (e) {
                clear();
                throw e;
            }
        });
    }

    protected readonly getResult = async <T>(url: string, req?: dp.Obj | null, opt: dRequest.Options & Partial<TCustomOpt> = {}): Promise<T> => {
        const { disableVersionCheck, defaultErrorPrompt, defaultErrorPromptStyle } = this.options;
        const { type = eHttp.MethodType.POST, noReportError, errorPrompt, errorPromptStyle } = opt;

        const nowShowPrompt = errorPrompt == null ? defaultErrorPrompt : errorPrompt;
        const nowPromptStyleType = errorPromptStyle == null ? defaultErrorPromptStyle : errorPromptStyle;

        const defaultMsg = '通信异常！请稍后再试！';
        const apiInfo: dRequest.FetchInfo = {
            url,
            req,
            rsp: undefined
        };
        const key = 'hRequest_getResult_';

        let rsp: dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody | null;
        try {
            rsp = await this.fetchJson<dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody | null>(type, url, req, opt);
            apiInfo.rsp = rsp;
        } catch (e) {
            const error = e as dp.Obj;
            if (!(!this.onGetResultError ? true : await this.onGetResultError(error, opt, apiInfo))) throw new cError.Noop();

            throw new cError.ApiFetchFail(
                {
                    error,
                    apiInfo
                },
                {
                    key: `${key}fetch_fail`,
                    showPrompt: nowShowPrompt,
                    promptStyleType: nowPromptStyleType,
                    msg: (error && (error.msg || error.message) || defaultMsg) as string
                },
                noReportError === true ? false : {
                    key: `${key}fetch_fail`,
                    type: eReport.LogType.WebTopError,
                    details: apiInfo,
                    error,
                    always: true,
                    attribute: true
                });
        }

        if (rsp && rsp.data !== undefined && rsp.code === eFetch.JsonSuccessCode.Success) {
            return rsp.data;
        }
        if (!(!this.onGetResultError ? true : await this.onGetResultError(null, opt, apiInfo))) throw new cError.Noop();

        if (!rsp) {
            throw new cError.ApiJsonResultEmpty(
                {
                    apiInfo
                },
                {
                    key: `${key}rsp_empty`,
                    showPrompt: nowShowPrompt,
                    promptStyleType: nowPromptStyleType,
                    msg: defaultMsg
                }, noReportError === true ? false : {
                    key: `${key}rsp_empty`,
                    type: eReport.LogType.WebTopError,
                    details: apiInfo,
                    always: true,
                    attribute: true
                });
        }

        if (!disableVersionCheck && rsp.version && rsp.version !== process.env.APP_VERSION) {
            this.onVersionMismatch();
        }

        const code = rsp.code;

        if (code === eFetch.JsonErrorCode.NoLogin ||
            code === eFetch.JsonErrorCode.LoginInvalid ||
            code === eFetch.JsonErrorCode.LoginExpired ||
            code === eFetch.JsonErrorCode.IllegalLoginUser
        ) {
            throw new cError.LoginError(
                {
                    rsp,
                    apiInfo
                },
                {
                    key: `${key}login_error`,
                    msg: rsp.msg || '请登录！'
                });
        }

        throw new cError.ApiJsonResultError(
            {
                rsp,
                apiInfo
            },
            {
                key: `${key}api_error`,
                showPrompt: nowShowPrompt,
                promptStyleType: nowPromptStyleType,
                msg: rsp.msg
            });
    }
    protected readonly getNoHandleResult = async <T>(url: string, req?: dp.Obj | null, opt: dRequest.DetailsOptions & Partial<TCustomOpt> = {}) => {
        const { type = eHttp.MethodType.POST, checkLoginWhenNoHandle } = opt;

        const defaultMsg = '通信异常！请稍后再试！';
        const apiInfo: dRequest.FetchInfo = {
            url,
            req,
            rsp: null
        };
        const key = 'hRequest_getNoHandleResult_';

        let rsp: dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody;
        try {
            rsp = await this.fetchJson<dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody>(type, url, req, opt);
            apiInfo.rsp = rsp;
        } catch (e) {
            const error = e as dp.Obj;
            this.onGetNoHandleResultError && await this.onGetNoHandleResultError(error, opt, apiInfo);

            const msg = error && (error.msg || error.message) || defaultMsg;
            return {
                code: eFetch.JsonErrorCode.FetchError,
                msg
            };
        }

        const code = rsp.code;

        this.preGetNoHandleResult && await this.preGetNoHandleResult(rsp, opt, apiInfo);

        if (checkLoginWhenNoHandle) {
            if (code === eFetch.JsonErrorCode.NoLogin ||
                code === eFetch.JsonErrorCode.LoginInvalid ||
                code === eFetch.JsonErrorCode.LoginExpired ||
                code === eFetch.JsonErrorCode.IllegalLoginUser
            ) {
                throw new cError.LoginError(
                    {
                        rsp,
                        apiInfo
                    },
                    {
                        key: `${key}login_error`,
                        msg: rsp.msg || '请登录！'
                    });
            }
        }

        return {
            ...rsp,
            data: rsp.data
        };
    }

    public readonly fetchJson = async <T>(type: eHttp.MethodType, url: string, req?: string | dp.Obj | FormData | null, opt: dRequest.Options & Partial<TCustomOpt> = {}) => {
        let data;
        let xhr;

        if (opt.isJsonpFetch) {
            const reqObj = uString.check(req) ? uHttp.parseUrl(req) : req;
            data = await this.jsonpFetch<T>(url, reqObj || {}, opt);
        } else {
            xhr = await this.fetch(type, url, req, opt);

            data = uObject.parseJson<T>(xhr.responseText);
        }
        this.onFetchSuccess && await this.onFetchSuccess(opt, { url, req, rsp: data }, xhr);

        if (data) {
            return data;
        }
        throw {
            xhr,
            response: xhr && {
                responseText: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText
            },
            request: {
                type,
                url,
                req,
                opt
            },
            msg: '网络异常！请稍后再试'
        };
    }

    public readonly getLocalUrl = (url: string) => (this.options.prefix || '') + url;

    public readonly fetch = (type: eHttp.MethodType, oriUrl: string, req?: string | dp.Obj | FormData | null, opt: dRequest.Options = {}) => {
        let url = oriUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = this.getLocalUrl(url);
        }

        const sendData = req || {};
        const p = new Promise<XMLHttpRequest>((resolve, reject) => {
            const { timeout = this.options.timeout == null ? eDate.MsTimespan.RequestTimeout : this.options.timeout,
                contentType, headers = {}, withCredentials, requestedWith = eHttp.RequestedWith.XMLHttpRequest } = opt;
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'text';
            if (withCredentials !== undefined) {
                xhr.withCredentials = withCredentials;
            }

            setTimeout(() => {
                reject({ msg: '请求超时！' });
                xhr.abort();
            }, timeout);

            const readyState = 4;
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== readyState) {
                    return;
                }
                resolve(xhr);
            };

            if (uString.equalIgnoreCase(type, eHttp.MethodType.GET)) {
                xhr.open(type, uHttp.urlAddQuery(url, sendData), true);
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
                    if (contentType !== null) xhr.setRequestHeader('Content-Type', contentType ?? eHttp.ContentType.MULTIPART);
                    xhr.send(sendData);
                } else {
                    if (contentType === eHttp.ContentType.JSON || contentType === undefined) {
                        xhr.setRequestHeader('Content-Type', eHttp.ContentType.JSON);
                        xhr.send(JSON.stringify(sendData));
                    } else if (contentType === eHttp.ContentType.FORM) {
                        xhr.setRequestHeader('Content-Type', eHttp.ContentType.FORM);
                        xhr.send(uString.check(sendData) ? sendData : uHttp.stringifyQuery(sendData));
                    } else {
                        xhr.send(JSON.stringify(sendData));
                    }
                }
            }
        });

        return p;
    }

    public readonly formFetch = (url: string, req?: dp.Obj, opt: dRequest.Options = {}) => {
        const { formRequestKey = cKey.query.FORM_REQUEST } = this.options;
        const { type = eHttp.MethodType.POST } = opt;

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
    }
}

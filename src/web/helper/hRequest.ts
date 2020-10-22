/**
 * @Creater cmZhou
 * @Desc request helper
 */
import cError from '../constant/cError';
import cKey from '../constant/cKey';
import { uHttp } from '../util/uHttp';
import { uObject } from '../util/uObject';
import { uString } from '../util/uString';
import { uTask } from '../util/uTask';
import { uUuid } from '../util/uUuid';

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
        openRandomErrorTest?: boolean;
        errorProbability?: number;
    }) { }

    private readonly onVersionMismatch = uTask.debounce(() => {
        throw new cError.VersionMismatch({ msg: '版本不匹配！' });
    }, this.options.versionCheckInterval);

    protected abstract readonly onFetchSuccess?: (opt: dRequest.Options & Partial<TCustomOpt>, details: dRequest.ApiInfo, ajax?: XMLHttpRequest) => dp.PromiseOrSelf<void>;
    protected abstract readonly onGetResultError?: (error: object | null, opt: dRequest.Options & Partial<TCustomOpt>, details: dRequest.ApiInfo) => dp.PromiseOrSelf<boolean>;
    protected abstract readonly preGetNoHandleResult?: (rsp: dFetch.SuccessJsonBody<any> | dFetch.ErrorJsonBody | null, opt: dRequest.DetailsOptions & Partial<TCustomOpt>, details: dRequest.ApiInfo) => dp.PromiseOrSelf<void>;
    protected abstract readonly onGetNoHandleResultError?: (error: any, opt: dRequest.DetailsOptions & Partial<TCustomOpt>, details: dRequest.ApiInfo) => dp.PromiseOrSelf<void>;

    public readonly api = new Proxy<any>({}, {
        get: (_target, controllerName) =>
            new Proxy({}, {
                get: (_controller, actionName) =>
                    (req?: dp.Obj, opt: dRequest.Options & Partial<TCustomOpt> = {}) => this.handleApi(controllerName.toString(), actionName.toString(), req, opt)
            })
    }) as dRequest.BaseApi<TControllers, TCustomOpt>;

    private readonly handleApi = (controllerName: string, actionName: string, req?: dp.Obj, opt: dRequest.Options & Partial<TCustomOpt> = {}) => {
        const { isFormFetch, noHandle, retryTimes, onCustomRetry } = opt;

        const maxRetryTimes = (retryTimes == null ? this.options.defaultRetryTimes : retryTimes) || 0;
        let nowRetryTimes = 0;

        const url = `/${controllerName}/${actionName}`;

        if (this.options.openRandomErrorTest) {
            try {
                this.testError(url, req);
            } catch (e) {
                const error = e as InstanceType<typeof cError.ApiFetchFail>;
                if (noHandle) {
                    return {
                        code: eFetch.JsonErrorCode.CommonFail,
                        msg: error.options.msg
                    };
                }

                throw e;
            }
        }

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
                if (onCustomRetry) {
                    nowRetryTimes++;
                    if (await onCustomRetry({
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

    private readonly testError = (url: string, req: any) => {
        const defaultProbability = 0.2;
        const { errorProbability = defaultProbability } = this.options;

        const msg = '【前端】随机测试错误，请检查你的异常处理好不好使。';

        if (process.env.IS_TEST && Math.random() < errorProbability) {
            throw new cError.ApiFetchFail(
                {
                    error: null,
                    apiInfo: {
                        url,
                        req,
                        rsp: {
                            code: eFetch.JsonErrorCode.CommonFail,
                            msg
                        }
                    }
                },
                {
                    showPrompt: ePrompt.Type.Toast,
                    promptStyleType: ePrompt.StyleType.Error,
                    msg
                }, false);
        }
    }

    protected readonly jsonpFetch = <T>(url: string, req: dp.Obj, opt: dRequest.Options = {}) => {
        const { timeout = this.options.timeout == null ? eDate.Timespan.RequestTimeout : this.options.timeout, jsonpCallbackParamName = 'callback', jsonpCallbackFuncName } = opt;

        return new Promise<T>((resolve, reject) => {
            const script = document.createElement('script');
            const funcName = jsonpCallbackFuncName || `_jsonpcb_${Date.now()}_${uUuid.get()}_`;
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

    protected readonly formFetch = (url: string, req?: dp.Obj, opt: dRequest.Options = {}) => {
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

    protected readonly getResult = async <T>(url: string, req?: dp.Obj | null, opt: dRequest.Options & Partial<TCustomOpt> = {}): Promise<T> => {
        const { disableVersionCheck, defaultErrorPrompt, defaultErrorPromptStyle } = this.options;
        const { type = eHttp.MethodType.POST, noReportError, errorPrompt, errorPromptStyle } = opt;

        const nowShowPrompt = errorPrompt == null ? defaultErrorPrompt : errorPrompt;
        const nowPromptStyleType = errorPromptStyle == null ? defaultErrorPromptStyle : errorPromptStyle;

        const defaultMsg = '通信异常！请稍后再试！';
        const apiInfo: dRequest.ApiInfo = {
            url,
            req,
            rsp: undefined
        };
        const key = 'web_hRequest_api_getResult_';

        let rsp: dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody | null;
        try {
            rsp = await this.apiFetch<dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody | null>(type, url, req, opt);
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
                    msg: rsp.msg || '请登录！'
                });
        }

        throw new cError.ApiJsonResultError(
            {
                rsp,
                apiInfo
            },
            {
                showPrompt: nowShowPrompt,
                promptStyleType: nowPromptStyleType,
                msg: rsp.msg
            });
    }
    protected readonly getNoHandleResult = async <T>(url: string, req?: dp.Obj | null, opt: dRequest.DetailsOptions & Partial<TCustomOpt> = {}) => {
        const { type = eHttp.MethodType.POST, checkLoginWhenNoHandle } = opt;

        const defaultMsg = '通信异常！请稍后再试！';
        const apiInfo: dRequest.ApiInfo = {
            url,
            req,
            rsp: null
        };

        let rsp: dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody;
        try {
            rsp = await this.apiFetch<dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody>(type, url, req, opt);
            apiInfo.rsp = rsp;
        } catch (e) {
            const error = e as dp.Obj;
            this.onGetNoHandleResultError && await this.onGetNoHandleResultError(error, opt, apiInfo);

            const msg = error && (error.msg || error.message) || defaultMsg;
            return {
                code: eFetch.JsonErrorCode.AjaxError,
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
                        msg: rsp.msg || '请登录！'
                    });
            }
        }

        return {
            ...rsp,
            data: rsp.data
        };
    }

    protected readonly apiFetch = async <T>(type: eHttp.MethodType, url: string, req?: dp.Obj | FormData | null, opt: dRequest.Options & Partial<TCustomOpt> = {}) => {
        let data;
        let ajax;

        if (opt.isJsonpFetch) {
            data = await this.jsonpFetch<T>(url, req || {}, opt);
        } else {
            ajax = await this.fetch(type, url, req, opt);

            data = uObject.jsonParse<T>(ajax.responseText);
        }
        this.onFetchSuccess && await this.onFetchSuccess(opt, { url, req, rsp: data }, ajax);

        if (data) {
            return data;
        }
        throw {
            response: ajax && {
                responseText: encodeURIComponent(ajax.responseText),
                status: ajax.status,
                statusText: encodeURIComponent(ajax.statusText)
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

    public readonly fetch = (type: eHttp.MethodType, oriUrl: string, req?: dp.Obj | FormData | null, opt: dRequest.Options = {}) => {
        let url = oriUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = this.getLocalUrl(url);
        }

        const sendData = req || {};
        const p = new Promise<XMLHttpRequest>((resolve, reject) => {
            const { timeout = this.options.timeout == null ? eDate.Timespan.RequestTimeout : this.options.timeout, contentType = eHttp.ContentType.JSON, headers = {}, withCredentials } = opt;
            const ajax = new XMLHttpRequest();
            ajax.responseType = 'text';
            if (withCredentials !== undefined) {
                ajax.withCredentials = withCredentials;
            }

            setTimeout(() => {
                reject({ msg: '请求超时！' });
                ajax.abort();
            }, timeout);

            const readyState = 4;
            ajax.onreadystatechange = () => {
                if (ajax.readyState !== readyState) {
                    return;
                }
                resolve(ajax);
            };

            if (uString.equalIgnoreCase(type, eHttp.MethodType.GET)) {
                ajax.open(type, uHttp.urlAddQuery(url, sendData), true);
                Object.keys(headers).forEach(k => {
                    ajax.setRequestHeader(k, headers[k]);
                });
                ajax.send(undefined);
            } else {
                ajax.open(type, url, true);
                ajax.setRequestHeader('x-requested-with', 'XMLHttpRequest');
                Object.keys(headers).forEach(k => {
                    ajax.setRequestHeader(k, headers[k]);
                });
                if (typeof FormData !== 'undefined' && uObject.checkInstance(sendData, FormData)) {
                    ajax.send(sendData);
                } else {
                    ajax.setRequestHeader('Content-Type', contentType);
                    if (contentType === eHttp.ContentType.JSON) {
                        ajax.send(JSON.stringify(sendData));
                    } else if (contentType === eHttp.ContentType.FORM) {
                        ajax.send(uHttp.paramsToQuery(sendData));
                    }
                }
            }
        });

        return p;
    }
}

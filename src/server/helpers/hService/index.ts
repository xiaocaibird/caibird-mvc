/**
 * @Owners cmZhou
 * @Title service helper
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import formData from 'form-data';

import { cError } from '../../consts/cError';

import DubboClient from './DubboClient';
import { AttachmentValue } from './Encode';

const defaultSuccessCodes = [0, '0'];
const defaultBaseServiceConfig = {
    version: '1.0',
    group: 'on',
    groupName: 'DEFAULT_GROUP',
    category: 'providers',
};

type ApiParamsFuncOpt<THttpApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>>, TRpcApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>>> = {
    serviceName: string,
    apiName: string,
    apiOpt: Caibird.dService.ApiOptions,
    options: Options<THttpApis, TRpcApis>,
};

type HttpApiParamsFuncOpt<THttpApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>>, TRpcApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>>> = ApiParamsFuncOpt<THttpApis, TRpcApis> & {
    apiConfig: Caibird.dService.HttpApiConfig,
};

type Options<THttpApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>> | never, TRpcApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>> | never> = {
    rpcConfig?: {
        version?: string,
        registry: {
            serverList: string,
            namespace: string,
            logger?: {
                [K in keyof typeof console]: Caibird.dp.Func
            },
        },
        services: {
            [K in keyof TRpcApis]: Caibird.dService.RpcServiceConfigItem<TRpcApis[K]>
        },

        successCodes?: (number | string)[],
        baseServiceConfig?: typeof defaultBaseServiceConfig,
        subscribeTimeout?: number,
        socketTimeout?: number,
        maxRequestBodyLength?: number,

        getAttachmentOnRequest?(defaultAttachment?: Caibird.dp.Obj<AttachmentValue>): Caibird.dp.PromiseOrSelf<Caibird.dp.Obj<AttachmentValue>>,

        handleResult?(rsp: Caibird.dService.Response<unknown>, req: unknown, opt: ApiParamsFuncOpt<THttpApis, TRpcApis>): Caibird.dp.PromiseOrSelf<Caibird.dService.Response<unknown>>,
    },
    httpConfig?: {
        defOpts?: AxiosRequestConfig,
        services: {
            [K in keyof THttpApis]: {
                [P in keyof THttpApis[K]]: Caibird.dService.HttpApiConfig
            }
        },
        successCodes?: (number | string)[],

        domain?: string | ((opt: HttpApiParamsFuncOpt<THttpApis, TRpcApis>) => Caibird.dp.PromiseOrSelf<string>),
        referer?: string | ((opt: HttpApiParamsFuncOpt<THttpApis, TRpcApis>) => Caibird.dp.PromiseOrSelf<string>),
        headers?: Caibird.dp.Obj<number | string> | ((opt: HttpApiParamsFuncOpt<THttpApis, TRpcApis>) => Caibird.dp.PromiseOrSelf<Caibird.dp.Obj<number | string>>),

        handleResult?(rsp: Caibird.dService.Response<unknown>, req: unknown, axiosParams: AxiosRequestConfig, axiosResponse: AxiosResponse, opt: HttpApiParamsFuncOpt<THttpApis, TRpcApis>): Caibird.dp.PromiseOrSelf<Caibird.dService.Response<unknown>>,
    },
    hideCodeInMsg?: boolean,
    successCodes?: (number | string)[],
    handleResult?(rsp: Caibird.dService.Response<unknown>, req: unknown, opt: ApiParamsFuncOpt<THttpApis, TRpcApis>): Caibird.dp.PromiseOrSelf<Caibird.dService.Response<unknown>>,
};

export abstract class HService<THttpApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>>, TRpcApis extends Caibird.dp.Obj<Caibird.dp.Obj<Caibird.dp.Func>>> {
    protected constructor(private readonly opt: Options<THttpApis, TRpcApis>) { }

    private _dubboClient?: DubboClient;

    public get dubboClient() {
        if (!this._dubboClient) {
            const { rpcConfig } = this.opt;
            if (!rpcConfig) {
                throw new Error('no set rpcConfig');
            }
            this._dubboClient = new DubboClient({
                version: rpcConfig.version || '2.7.7.0',
                registry: {
                    logger: rpcConfig.registry.logger ?? {
                        ...console,
                        info: () => { },
                        debug: () => { },
                    },
                    serverList: rpcConfig.registry.serverList,
                    namespace: rpcConfig.registry.namespace,
                },
                services: Object.keys(rpcConfig.services).reduce<Caibird.dp.Obj<Caibird.dService.DubboServiceDefine>>((result, key) => {
                    result[key] = {
                        ...(rpcConfig.baseServiceConfig ?? defaultBaseServiceConfig),
                        ...rpcConfig.services[key],
                    };
                    return result;
                }, {}),
                subscribeTimeout: rpcConfig.subscribeTimeout,
                socketTimeout: rpcConfig.socketTimeout,
                maxRequestBodyLength: rpcConfig.maxRequestBodyLength,
                // eslint-disable-next-line @typescript-eslint/tslint/config
                getAttachmentOnRequest: rpcConfig.getAttachmentOnRequest,
            });
        }
        return this._dubboClient;
    }

    public readonly http = new Proxy<Caibird.dp.Obj>({}, {
        get: (_target, serviceName) =>
            new Proxy({}, {
                get: (_controller, apiName) => this.proxyGet(serviceName, apiName, 'http'),
            }),
    }) as Caibird.dService.GetApi<THttpApis>;

    public readonly rpc = new Proxy<Caibird.dp.Obj>({}, {
        get: (_target, serviceName) =>
            new Proxy({}, {
                get: (_controller, apiName) => this.proxyGet(serviceName, apiName, 'rpc'),
            }),
    }) as Caibird.dService.GetApi<TRpcApis>;

    private readonly proxyGet = (sName: number | string | symbol, aName: number | string | symbol, type: 'http' | 'rpc') => async (req?: unknown, opt: Caibird.dService.ApiOptions = {}) => {
        const { hideCodeInMsg } = this.opt;

        const serviceName = sName.toString();
        const apiName = aName.toString();

        let rsp = await this.handleApi(type, serviceName, apiName, req, opt);

        const funcOpt = {
            serviceName,
            apiName,
            apiOpt: opt,
            options: this.opt,
        };

        rsp = this.opt.handleResult ? await this.opt.handleResult(rsp, req, funcOpt) : rsp;

        if (opt.noHandle) return rsp;

        const successCodes = (type === 'http' ? this.opt.httpConfig?.successCodes : this.opt.rpcConfig?.successCodes) || this.opt.successCodes || defaultSuccessCodes;

        if (successCodes.includes(rsp.code)) return rsp.data;

        throw new cError.Json(`${rsp.msg || `hService.${type}.${serviceName}.${apiName} 请求失败！`}${hideCodeInMsg ? '' : `(${rsp.code})`}`);
    };

    private readonly handleApi = async (type: 'http' | 'rpc', serviceName: string, apiName: string, req?: unknown, opt: Caibird.dService.ApiOptions = {}) => {
        try {
            const { rpcConfig, httpConfig } = this.opt;
            if (type === 'rpc' && rpcConfig && serviceName in rpcConfig.services) {
                const serviceInfo = rpcConfig.services[serviceName];
                if (apiName in serviceInfo.methods) {
                    let rsp = await this.dubboClient.request(serviceName, apiName, req) as Caibird.dService.Response<unknown>;

                    const funcOpt = {
                        serviceName,
                        apiName,
                        apiOpt: opt,
                        options: this.opt,
                    };

                    rsp = rpcConfig.handleResult ? await rpcConfig.handleResult(rsp, req, funcOpt) : rsp;

                    return rsp;
                }
            } else if (type === 'http' && httpConfig && serviceName in httpConfig.services && apiName in httpConfig.services[serviceName]) {
                const serviceInfo = httpConfig.services[serviceName];
                const apiInfo = serviceInfo[apiName];

                const contentTpype = apiInfo.contentType ? apiInfo.contentType :
                    req instanceof formData ? Caibird.eHttp.ContentType.MULTIPART :
                        apiInfo.method === Caibird.eHttp.MethodType.GET ? Caibird.eHttp.ContentType.FORM : Caibird.eHttp.ContentType.JSON;

                const funcOpt = {
                    serviceName,
                    apiName,
                    apiOpt: opt,
                    apiConfig: apiInfo,
                    options: this.opt,
                };

                const domain = opt.domain ?? (typeof httpConfig.domain === 'function' ? await httpConfig.domain(funcOpt) : httpConfig.domain ?? '');

                const referer = opt.referer ?? (typeof httpConfig.referer === 'function' ? await httpConfig.referer(funcOpt) : httpConfig.referer);

                const headers = opt.headers ?? (typeof httpConfig.headers === 'function' ? await httpConfig.headers(funcOpt) : httpConfig.headers);

                const axiosParams = {
                    ...httpConfig.defOpts,
                    method: apiInfo.method,
                    url: `${domain}${apiInfo.path}`,
                    headers: {
                        'Content-Type': contentTpype,
                        referer: referer ?? domain,
                        requestURI: `/${funcOpt.serviceName}/${funcOpt.apiName}`,
                        ...(req instanceof formData ? req.getHeaders() : undefined),
                        ...headers,
                    },
                    maxBodyLength: 20971520, // 20 * 1024 * 1024
                    params: apiInfo.method === Caibird.eHttp.MethodType.GET ? req : undefined,
                    data: apiInfo.method !== Caibird.eHttp.MethodType.GET ? req : undefined,
                };
                const axiosResponse = await axios(axiosParams);
                let rsp = axiosResponse.data as Caibird.dService.Response<unknown>;

                rsp = httpConfig.handleResult ? (await httpConfig.handleResult(rsp, req, axiosParams, axiosResponse, funcOpt)) : rsp;

                return rsp;
            }
        } catch (e) {
            throw e;
        }

        throw new cError.Json(`hService.${type}.${serviceName}.${apiName} 未定义！`);
    };
}

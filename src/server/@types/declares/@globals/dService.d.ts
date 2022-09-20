/**
 * @Owners cmZhou
 * @Title dService
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Caibird.dService {
    type RpcGetReq<T extends dp.Func> = Parameters<T>[0];

    type ApiOptions<TNoHandle extends boolean | undefined = undefined> = {
        noHandle?: TNoHandle,
        headers?: dp.Obj<string>,
        domain?: string,
        referer?: string,
    };

    type GetApi<T extends dp.Obj<dp.Obj<dp.Func>>> = {
        [S in keyof T]: {
            [M in keyof T[S]]: T[S][M] extends dp.Func ? (
                T[S][M] extends () => any ?
                (
                    <TNoHandle extends boolean | undefined = undefined>(req?: null | undefined, opt?: ApiOptions<TNoHandle>) =>
                        TNoHandle extends true ? Promise<Response<ReturnType<T[S][M]>>> : Promise<ReturnType<T[S][M]>>
                ) :
                (
                    <TNoHandle extends boolean | undefined = undefined>(req: Parameters<T[S][M]>[0], opt?: ApiOptions<TNoHandle>) =>
                        TNoHandle extends true ? Promise<Response<ReturnType<T[S][M]>>> : Promise<ReturnType<T[S][M]>>
                )
            ) : never;
        };
    };

    type DubboServiceDefine = Required<RpcServiceConfigItem<dp.Obj<dp.Func>>>;

    type RpcServiceConfigItem<T extends dp.Obj<dp.Func>> = {
        version?: string,
        group?: string,
        groupName?: string,
        category?: string,

        interfaceName: string,
        methods: {
            [K in keyof T]: (req: Parameters<T[K]>[0]) => { $class: string, $: any }[]
        },
    };

    interface CustomHttpApiConfig { }

    type HttpApiConfig = CustomHttpApiConfig & {
        method: eHttp.MethodType,
        path: string,
        contentType?: eHttp.ContentType,
    };

    type HttpServiceConfigItem<T extends string> = Record<T, HttpApiConfig>;

    interface CustomResponseBase { }

    type ResponseFailCode = number | string;

    type ResponseBase = CustomResponseBase & {
        code: eService.ResponseSuccess | ResponseFailCode,
        msg?: string,
    };

    interface ResponseSuccess<T> extends ResponseBase {
        code: eService.ResponseSuccess,
        data: T,
        timestamp: number,
    }

    interface ResponseError extends ResponseBase {
        code: ResponseFailCode,
        data?: undefined,
    }

    type Response<T> = ResponseError | ResponseSuccess<T>;
}

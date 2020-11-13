/**
 * @Creater cmZhou
 * @Desc request 常用类型
 */
declare namespace dRequest {
    type Options<TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined, TCustom extends object = {}> = {
        noHandle?: TNoHandle;
        timeout?: number;
        contentType?: string | null;
        requestedWith?: string | null;
        withCredentials?: boolean;
        isFormFetch?: TFormFetch;
        isJsonpFetch?: boolean;
        jsonpCallbackParamName?: string;
        jsonpCallbackFuncName?: string;
        type?: eHttp.MethodType;
        noReportError?: boolean;
        errorPrompt?: ePrompt.Type;
        errorPromptStyle?: ePrompt.StyleType;
        retryTimes?: number;
        headers?: dp.Obj<string>;
        shouldRetry?(opt: {
            error: any;
            nowRetryTimes: number;
        }): dp.PromiseOrSelf<boolean>;
    } & Partial<TCustom>;

    type DetailsOptions<TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined, TCustom extends object = {}> =
        Options<TNoHandle, TFormFetch, TCustom> & {
            checkLoginWhenNoHandle?: boolean;
        };

    type GetReq<T> = T extends dFetch.ApiData<any, any> ? T['req'] : never;
    type GetRsp<T> = T extends dFetch.ApiData<any, any> ? T['rsp'] : never;

    type Details<T> = dFetch.SuccessJsonBody<T> | dFetch.ErrorJsonBody;

    type BaseApi<TControllers extends dFetch.BaseControllers, TCustom extends object> = {
        readonly [C in keyof dFetch.BaseApi<TControllers>]: {
            readonly [A in keyof dFetch.BaseApi<TControllers>[C]]: GetReq<dFetch.BaseApi<TControllers>[C][A]> extends never ?
            <TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined>
                (req?: null, opt?: TNoHandle extends true ? DetailsOptions<TNoHandle, TFormFetch, TCustom> : Options<TNoHandle, TFormFetch, TCustom>) =>
                Promise<TFormFetch extends true ? never : TNoHandle extends true ? Details<GetRsp<dFetch.BaseApi<TControllers>[C][A]>> : GetRsp<dFetch.BaseApi<TControllers>[C][A]>> :
            <TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined>
                (req: GetReq<dFetch.BaseApi<TControllers>[C][A]>, opt?: TNoHandle extends true ? DetailsOptions<TNoHandle, TFormFetch, TCustom> : Options<TNoHandle, TFormFetch, TCustom>) =>
                Promise<TFormFetch extends true ? never : TNoHandle extends true ? Details<GetRsp<dFetch.BaseApi<TControllers>[C][A]>> : GetRsp<dFetch.BaseApi<TControllers>[C][A]>>
        }
    };

    type ApiInfo = {
        url: string;
        req?: any;
        rsp?: any;
    };
}

/**
 * @Owners cmZhou
 * @Title request 常用类型
 */
declare namespace dRequest {
    namespace F {
        type Options<TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined, TCustom extends dCaibird.Obj = dCaibird.Obj> = Partial<TCustom> & {
            noHandle?: TNoHandle,
            timeout?: number,
            contentType?: string | null,
            requestedWith?: string | null,
            withCredentials?: boolean,
            isFormFetch?: TFormFetch,
            isJsonpFetch?: boolean,
            jsonpCallbackParamName?: string,
            jsonpCallbackFuncName?: string,
            type?: eCaibird.Http.MethodType,
            noReportError?: boolean,
            errorPrompt?: ePrompt.F.Type,
            errorPromptStyle?: ePrompt.F.StyleType,
            retryTimes?: number,
            headers?: dCaibird.Obj<string>,
            shouldRetry?(opt: {
                error: unknown,
                nowRetryTimes: number,
            }): dCaibird.PromiseOrSelf<boolean>,
        };

        type DetailsOptions<TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined, TCustom extends dCaibird.Obj = dCaibird.Obj> =
            Options<TNoHandle, TFormFetch, TCustom> & {
                checkLoginWhenNoHandle?: boolean,
            };

        type GetReq<T> = T extends dFetch.ApiInfo<unknown, unknown> ? T['req'] : never;
        type GetRsp<T> = T extends dFetch.ApiInfo<unknown, unknown> ? T['rsp'] : never;

        type Details<T> = dFetch.ErrorJsonBody | dFetch.SuccessJsonBody<T>;

        type Api<TControllers extends dFetch.BaseControllers, TCustom extends dCaibird.Obj> = {
            readonly [C in keyof dFetch.StandardApi<TControllers>]: {
                readonly [A in keyof dFetch.StandardApi<TControllers>[C]]: GetReq<dFetch.StandardApi<TControllers>[C][A]> extends never ?
                <TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined>
                (req?: null, opt?: TNoHandle extends true ? DetailsOptions<TNoHandle, TFormFetch, TCustom> : Options<TNoHandle, TFormFetch, TCustom>) =>
                Promise<TFormFetch extends true ? never : TNoHandle extends true ? Details<GetRsp<dFetch.StandardApi<TControllers>[C][A]>> : GetRsp<dFetch.StandardApi<TControllers>[C][A]>> :
                <TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined>
                (req: GetReq<dFetch.StandardApi<TControllers>[C][A]>, opt?: TNoHandle extends true ? DetailsOptions<TNoHandle, TFormFetch, TCustom> : Options<TNoHandle, TFormFetch, TCustom>) =>
                Promise<TFormFetch extends true ? never : TNoHandle extends true ? Details<GetRsp<dFetch.StandardApi<TControllers>[C][A]>> : GetRsp<dFetch.StandardApi<TControllers>[C][A]>>
            }
        };

        type FetchInfo = {
            url: string,
            req?: unknown,
            rsp?: unknown,
        };
    }
}

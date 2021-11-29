/**
 * @Owners cmZhou
 * @Title dRequest
 */
import { ePrompt } from '../enums';

export namespace dRequest {
    type BaseOptions = {
        timeout?: number,
        contentType?: string | null,
        requestedWith?: string | null,
        withCredentials?: boolean,
        isJsonpFetch?: boolean,
        jsonpCallbackParamName?: string,
        jsonpCallbackFuncName?: string,
        type?: Caibird.eHttp.MethodType,
        noReportError?: boolean,
        errorPrompt?: ePrompt.Type,
        errorPromptStyle?: ePrompt.StyleType,
        retryTimes?: number,
        headers?: Caibird.dp.Obj<string>,
        shouldRetry?(opt: {
            error: unknown,
            nowRetryTimes: number,
        }): Caibird.dp.PromiseOrSelf<boolean>,
    };

    type Options<TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined, TCustom extends Caibird.dp.Obj = Caibird.dp.Obj> = BaseOptions & Partial<TCustom> & {
        noHandle?: TNoHandle,
        isFormFetch?: TFormFetch,
    };

    type DetailsOptions<TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined, TCustom extends Caibird.dp.Obj = Caibird.dp.Obj> =
        Options<TNoHandle, TFormFetch, TCustom> & {
            checkLoginWhenNoHandle?: boolean,
        };

    type GetReq<T> = T extends Caibird.dFetch.ApiInfo<unknown, unknown> ? T['req'] : never;
    type GetRsp<T> = T extends Caibird.dFetch.ApiInfo<unknown, unknown> ? T['rsp'] : never;

    type Details<T> = Caibird.dFetch.ErrorJsonBody | Caibird.dFetch.SuccessJsonBody<T>;

    type Api<TControllers extends Caibird.dFetch.BaseControllers, TCustom extends Caibird.dp.Obj> = {
        readonly [C in keyof Caibird.dFetch.StandardApi<TControllers>]: {
            readonly [A in keyof Caibird.dFetch.StandardApi<TControllers>[C]]: GetReq<Caibird.dFetch.StandardApi<TControllers>[C][A]> extends never ?
            <TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined>
            (req?: null, opt?: TNoHandle extends true ? DetailsOptions<TNoHandle, TFormFetch, TCustom> : Options<TNoHandle, TFormFetch, TCustom>) =>
            Promise<TFormFetch extends true ? never : TNoHandle extends true ? Details<GetRsp<Caibird.dFetch.StandardApi<TControllers>[C][A]>> : GetRsp<Caibird.dFetch.StandardApi<TControllers>[C][A]>> :
            <TNoHandle extends boolean | undefined = undefined, TFormFetch extends boolean | undefined = undefined>
            (req: GetReq<Caibird.dFetch.StandardApi<TControllers>[C][A]>, opt?: TNoHandle extends true ? DetailsOptions<TNoHandle, TFormFetch, TCustom> : Options<TNoHandle, TFormFetch, TCustom>) =>
            Promise<TFormFetch extends true ? never : TNoHandle extends true ? Details<GetRsp<Caibird.dFetch.StandardApi<TControllers>[C][A]>> : GetRsp<Caibird.dFetch.StandardApi<TControllers>[C][A]>>
        }
    };

    type FetchInfo = {
        url: string,
        req?: unknown,
        rsp?: unknown,
    };
}

/**
 * @Owners cmZhou
 * @Title 通信常用类型
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Caibird.dFetch {
    // eslint-disable-next-line @typescript-eslint/ban-types
    type BaseControllers = dp.Obj<Function>;

    type ActionReq<T extends dp.Obj> = Partial<T>;

    // TODO 支持 (req?: any) => rsp
    type StandardApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiInfo<
                TControllers[C]['prototype'][A] extends () => unknown ? never :
                TControllers[C]['prototype'][A] extends (req: dp.Obj) => unknown ?
                TControllers[C]['prototype'][A] extends (req: ActionReq<infer Req>) => unknown ? Req extends dp.Obj ? Req : never : never : never,
                TControllers[C]['prototype'][A] extends ((...p: any[]) => Promise<infer Rsp>) ? Rsp extends JsonActionReturn<infer R> ? R : never : never
            >;
        };
    };

    type RealApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiInfo<
                TControllers[C]['prototype'][A] extends () => unknown ? never :
                TControllers[C]['prototype'][A] extends (req: ActionReq<infer Req>) => unknown ? Req :
                TControllers[C]['prototype'][A] extends (req: infer Req) => unknown ? Req : never,
                TControllers[C]['prototype'][A] extends (...p: any[]) => Promise<infer Rsp> ? Rsp extends JsonActionReturn<infer R> ? R :
                Rsp extends ActionReturn<unknown> ? never : Rsp :
                TControllers[C]['prototype'][A] extends (...p: any[]) => infer Rsp ? Rsp : never
            >;
        };
    };

    // eslint-disable-next-line @typescript-eslint/ban-types
    type GetApi<TController extends Function> = {
        [A in keyof TController['prototype']]: ApiInfo<
            TController['prototype'][A] extends () => unknown ? never :
            TController['prototype'][A] extends (req: dp.Obj) => unknown ?
            TController['prototype'][A] extends (req: ActionReq<infer Req>) => unknown ? Req extends dp.Obj ? Req : never : never : never,
            TController['prototype'][A] extends ((...p: any[]) => Promise<infer Rsp>) ? Rsp extends JsonActionReturn<infer R> ? R : never : never
        >;
    };

    interface SuccessJsonBody<T> extends JsonBody {
        code: eFetch.JsonSuccessCode.Success,
        data: T,
    }
    interface ErrorJsonBody extends JsonBody {
        code: eFetch.JsonErrorCode,
        data?: undefined,
    }

    type JsonBody = Partial<ExtendJsonBody> & {
        code: eFetch.JsonErrorCode | eFetch.JsonSuccessCode.Success,
        msg?: string,
        version?: string,
        fetchId?: string,
    };

    interface ExtendJsonBody { }

    type ApiInfo<TReq, TRsp> = {
        req: TReq,
        rsp: TRsp,
    };

    type ActionReturn<T> = {
        type: 'buffer' | 'file' | 'json' | 'redirect' | 'render' | 'xml',
        result: T,
    };

    interface JsonActionReturn<T extends dp.Obj<any> | null> extends ActionReturn<SuccessJsonBody<T>> {
        type: 'json',
    }

    interface FileActionReturn extends ActionReturn<{
        path: string,
        opt?: import('koa-send').SendOptions,
    }> {
        type: 'file',
    }

    interface RenderActionReturn<T extends dp.Obj | undefined> extends ActionReturn<{
        view: string,
        params?: T,
    }> {
        type: 'render',
    }

    interface BufferActionReturn extends ActionReturn<{
        buffer: Buffer,
        fileName: string,
        opt?: { type: eHttp.ContentDispositionType },
    }> {
        type: 'buffer',
    }

    interface RedirectActionReturn extends ActionReturn<{
        url: string,
    }> {
        type: 'redirect',
    }

    interface XmlActionReturn extends ActionReturn<{
        xmlStr: string,
    }> {
        type: 'xml',
    }
}

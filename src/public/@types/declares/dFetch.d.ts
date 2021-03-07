/**
 * @Owners cmZhou
 * @Title 通信常用类型
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace dFetch {
    // eslint-disable-next-line @typescript-eslint/ban-types
    type BaseControllers = dp.Obj<Function>;

    type StandardApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiInfo<
                TControllers[C]['prototype'][A] extends () => unknown ? never :
                TControllers[C]['prototype'][A] extends (req: dp.Obj) => unknown ?
                TControllers[C]['prototype'][A] extends (req: dMvc.S.ActionReq<infer Req>) => unknown ? Req extends dp.Obj ? Req : never : never : never,
                TControllers[C]['prototype'][A] extends ((...p: any[]) => Promise<infer Rsp>) ? Rsp extends dMvc.S.JsonActionReturn<infer R> ? R : never : never
            >;
        };
    };

    type RealApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiInfo<
                TControllers[C]['prototype'][A] extends () => unknown ? never :
                TControllers[C]['prototype'][A] extends (req: dMvc.S.ActionReq<infer Req>) => unknown ? Req :
                TControllers[C]['prototype'][A] extends (req: infer Req) => unknown ? Req : never,
                TControllers[C]['prototype'][A] extends (...p: any[]) => Promise<infer Rsp> ? Rsp extends dMvc.S.JsonActionReturn<infer R> ? R :
                Rsp extends dMvc.S.ActionReturn<unknown> ? never : Rsp :
                TControllers[C]['prototype'][A] extends (...p: any[]) => infer Rsp ? Rsp : never
            >;
        };
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
}

/**
 * @Creater cmZhou
 * @Desc 通信常用类型
 */
declare namespace dFetch {
    type BaseControllers = dp.Obj<Function>;

    type StandardApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiInfo<
                TControllers[C]['prototype'][A] extends () => unknown ? never :
                TControllers[C]['prototype'][A] extends (req: dp.Obj) => unknown ?
                TControllers[C]['prototype'][A] extends (req: dMvc.S.ActionReq<infer Req>) => unknown ? Req extends dp.Obj ? Req : never : never : never,
                TControllers[C]['prototype'][A] extends ((...p: unknown[]) => Promise<infer Rsp>) ? Rsp extends dMvc.S.JsonActionReturn<infer R> ? R : never : never
            >;
        };
    };

    type RealApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiInfo<
                TControllers[C]['prototype'][A] extends () => unknown ? never :
                TControllers[C]['prototype'][A] extends (req: dMvc.S.ActionReq<infer Req>) => unknown ? Req :
                TControllers[C]['prototype'][A] extends (req: infer Req) => unknown ? Req : never,
                TControllers[C]['prototype'][A] extends (...p: unknown[]) => Promise<infer Rsp> ? Rsp extends dMvc.S.JsonActionReturn<infer R> ? R :
                Rsp extends dMvc.S.ActionReturn<unknown> ? never : Rsp :
                TControllers[C]['prototype'][A] extends (...p: unknown[]) => infer Rsp ? Rsp : never
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

    type JsonBody = {
        code: eFetch.JsonErrorCode | eFetch.JsonSuccessCode.Success,
        msg?: string,
        version?: string,
        fetchId?: string,
    } & Partial<ExtendJsonBody>;

    interface ExtendJsonBody { }

    type ApiInfo<TReq, TRsp> = {
        req: TReq,
        rsp: TRsp,
    };
}

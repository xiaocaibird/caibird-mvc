/**
 * Created by cmZhou
 * 通信常用类型
 */
declare namespace dFetch {
    type BaseControllers = dp.Obj<Function>;

    type BaseApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiData<
                TControllers[C]['prototype'][A] extends () => any ? never :
                TControllers[C]['prototype'][A] extends (req: object) => any ?
                TControllers[C]['prototype'][A] extends (req: dMvc.ActionReq<infer Req>) => any ? Req extends object ? Req : never : never : never,
                TControllers[C]['prototype'][A] extends ((...p: any[]) => Promise<infer Rsp>) ? Rsp extends dMvc.JsonActionReturn<infer R> ? R : never : never
            >;
        };
    };

    type RealApi<TControllers extends BaseControllers> = {
        [C in keyof TControllers]: {
            [A in keyof TControllers[C]['prototype']]: ApiData<
                TControllers[C]['prototype'][A] extends () => any ? never :
                TControllers[C]['prototype'][A] extends (req: dMvc.ActionReq<infer Req>) => any ? Req :
                TControllers[C]['prototype'][A] extends (req: infer Req) => any ? Req : never,
                TControllers[C]['prototype'][A] extends (...p: any[]) => Promise<infer Rsp> ? Rsp extends dMvc.JsonActionReturn<infer R> ? R :
                Rsp extends dMvc.ActionReturn<any> ? never : Rsp :
                TControllers[C]['prototype'][A] extends (...p: any[]) => infer Rsp ? Rsp : never
            >;
        };
    };

    interface SuccessJsonBody<T> extends JsonBody {
        code: eFetch.JsonSuccessCode.Success;
        data: T;
    }
    interface ErrorJsonBody extends JsonBody {
        code: eFetch.JsonErrorCode;
        data?: undefined;
    }

    type JsonBody = {
        code: eFetch.JsonErrorCode | eFetch.JsonSuccessCode.Success;
        msg?: string;
        version?: string;
        fetchId?: string;
    } & Partial<ExtendJsonBody>;

    interface ExtendJsonBody { }

    type ApiData<TReq, TRsp> = {
        req: TReq;
        rsp: TRsp;
    };
}

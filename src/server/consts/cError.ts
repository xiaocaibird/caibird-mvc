/**
 * @Owners cmZhou
 * @Title 常用异常类
 */
import { uObject } from '../utils/uObject';

import { cMessage } from './cMessage';

namespace _cError {
    export class Base extends Error {
        public constructor(
            public readonly info: ErrorInfo,
            public readonly logOptions: dReport.ErrorLogOptions = {},
        ) {
            super(uObject.check(info) ? info.msg : info.toString());
        }

        public readonly name: string = 'BaseError';
    }

    export class ParameterJson extends Base {
        public constructor(
            msg = cMessage.jsonError[eCaibird.Fetch.JsonErrorCode.ParameterError],
            logOptions: dReport.ErrorLogOptions = {},
        ) {
            super({ code: eCaibird.Fetch.JsonErrorCode.ParameterError, msg }, logOptions);
        }

        public readonly name = 'ParameterJsonError';
    }

    export class Json extends Base {
        public constructor(
            info: Partial<dFetch.ErrorJsonBody> | string = {},
            logOptions: dReport.ErrorLogOptions = {},
        ) {
            super({ code: eCaibird.Fetch.JsonErrorCode.CommonFail, ...(uObject.check(info) ? info : { msg: info }) }, logOptions);
        }

        public readonly name: string = 'JsonError';
    }

    export class TimeoutJson extends Json {
        public constructor(
            msg = cMessage.jsonError[eCaibird.Fetch.JsonErrorCode.Timeout],
            logOptions: dReport.ErrorLogOptions = {},
        ) {
            super({ code: eCaibird.Fetch.JsonErrorCode.Timeout, msg }, logOptions);
        }

        public readonly name = 'TimeoutJsonError';
    }

    export class TopJson extends Json {
        public constructor(
            info: dFetch.ErrorJsonBody,
            logOptions: Omit<dReport.ErrorLogOptions, 'always' | 'attribute' | 'type'> = {},
        ) {
            super(info, { type: eCaibird.Report.LogType.TopError, always: true, attribute: true, ...logOptions });
        }

        public readonly name = 'TopJsonError';
    }

    export class Status extends Base {
        public constructor(
            info: eCaibird.Http.StatusCode | StatusInfo,
            logOptions: Omit<dReport.ErrorLogOptions, 'type'> = {},
        ) {
            super(info, {
                type: eCaibird.Report.LogType.StatusError,
                always: (uObject.check(info) ? info.status : info) === eCaibird.Http.StatusCode.ServerError ? true : false,
                attribute: (uObject.check(info) ? info.status : info) === eCaibird.Http.StatusCode.ServerError ? true : false,
                ...logOptions,
            });
        }

        public readonly name = 'StatusError';
    }

    export class Redis extends Base {
        public constructor(
            msg = cMessage.jsonError[eCaibird.Fetch.JsonErrorCode.RedisError],
            logOptions: dReport.ErrorLogOptions = {},
        ) {
            super({ code: eCaibird.Fetch.JsonErrorCode.RedisError, msg }, logOptions);
        }

        public readonly name = 'ReidsError';
    }
}

export const cError: dCaibird.DeepReadonly<typeof _cError> = _cError;

//#region 私有类型
type StatusInfo = {
    status: eCaibird.Http.StatusCode,
    msg: string,
};

type ErrorInfo = dFetch.ErrorJsonBody | eCaibird.Http.StatusCode | StatusInfo;
//#endregion

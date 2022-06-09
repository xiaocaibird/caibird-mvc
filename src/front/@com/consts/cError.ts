/**
 * @Owners cmZhou
 * @Title 常用异常类
 */
import type { dError, dReport, dRequest } from '../@types/declares';

let compatible: (instance: Error, args: unknown[]) => void = () => { };

export const setCompatible = (fn: typeof compatible) => compatible = fn;
namespace _cError {
    export class BassError extends Error { }

    export class CommonError extends BassError {
        public constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
            public override readonly name = CommonError.name,
        ) {
            super();
            compatible(this, [...arguments]);
        }
    }

    export class ReactError extends CommonError {
        public constructor(
            public readonly details: {
                error: Error,
                errorInfo: React.ErrorInfo,
            },
            public override readonly options: dError.Options,
            public override readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ReactError.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiFetchFail extends CommonError {
        public constructor(
            public readonly details: {
                error: unknown,
                info: dRequest.FetchInfo,
            },
            public override readonly options: dError.Options,
            public override readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiFetchFail.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultEmpty extends CommonError {
        public constructor(
            public readonly details: {
                info: dRequest.FetchInfo,
            },
            public override readonly options: dError.Options,
            public override readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiJsonResultEmpty.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultError extends CommonError {
        public constructor(
            public readonly details: {
                rsp: Caibird.dFetch.JsonBody,
                info: dRequest.FetchInfo,
            },
            public override readonly options: dError.Options,
            public override readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiJsonResultError.name);
            compatible(this, [...arguments]);
        }
    }

    export class LoginError extends CommonError {
        public constructor(
            public readonly details: {
                rsp: Caibird.dFetch.JsonBody,
                info: dRequest.FetchInfo,
            },
            public override readonly options: dError.Options,
            public override readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, LoginError.name);
            compatible(this, [...arguments]);
        }
    }

    export class VersionMismatch extends CommonError {
        public constructor(
            public override readonly options: dError.Options,
            public override readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, VersionMismatch.name);
            compatible(this, [...arguments]);
        }
    }

    export class Noop extends BassError {
        public constructor(public msg?: string) {
            super();
            compatible(this, [...arguments]);
        }

        public override readonly name = Noop.name;
    }
}

export const cError: Caibird.dp.DeepReadonly<typeof _cError> = _cError;

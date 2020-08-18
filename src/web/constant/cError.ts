/**
 * Created by cmZhou
 * 常用异常类
 */
let onAppError: undefined | ((err: Error) => dp.PromiseOrSelf<void>);

export const setOnAppError = (fn: (err: Error) => dp.PromiseOrSelf<void>) => onAppError = fn;

(Error as any) = class extends Error {
    constructor(...p: dp.GetClassParams<ErrorConstructor>) {
        super(...p);
        setTimeout(async () => {
            if (!this.disableDefaultErrorHandler) {
                try {
                    onAppError && await onAppError(this);
                } catch (e) {
                    console.error('global error:', e);
                }
            }
        }, eNumber.Common.Ten * 2);
    }

    public disableDefaultErrorHandler = false;
};

namespace _cError {
    export class Common extends Error {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super();
        }
        public readonly name: string = 'CommonError';

        public disableDefaultErrorHandler = false;
    }

    export class ApiFetchFail extends Common {
        constructor(
            public readonly details: {
                error: any;
                apiInfo: dRequest.ApiInfo;
            },
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name: string = 'ApiFetchFailError';
    }

    export class ApiJsonResultEmpty extends Common {
        constructor(
            public readonly details: {
                apiInfo: dRequest.ApiInfo;
            },
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name: string = 'ApiJsonResultEmptyError';
    }

    export class ApiJsonResultError extends Common {
        constructor(
            public readonly details: {
                rsp: dFetch.JsonBody;
                apiInfo: dRequest.ApiInfo;
            },
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name: string = 'ApiJsonResultError';
    }

    export class LoginError extends Common {
        constructor(
            public readonly details: {
                rsp: dFetch.JsonBody;
                apiInfo: dRequest.ApiInfo;
            },
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name: string = 'LoginError';
    }

    export class VersionMismatch extends Common {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name: string = 'VersionMismatchError';
    }

    export class Noop extends Error {
        public readonly name = 'NoopError';
    }
}

export const cError: dp.DeepReadonly<typeof _cError> = _cError;
export default cError;

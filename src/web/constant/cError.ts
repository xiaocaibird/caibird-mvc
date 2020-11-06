/**
 * @Creater cmZhou
 * @Desc 常用异常类
 */
let onAppError: undefined | ((err: Error) => dp.PromiseOrSelf<void>);

export const setOnAppError = (fn: (err: Error) => dp.PromiseOrSelf<void>) => onAppError = fn;

window.addEventListener('error', evt => {
    let error = evt.error as Error | undefined;
    if (!error) {
        try {
            const split = evt.message.split(':');
            const errName = split[0].trim() as keyof typeof cError;
            const errJson = JSON.parse(split[1].trim());
            const ErrClass = cError[errName];
            error = new (ErrClass as any)() as Error;

            Object.assign(error, errJson);
        } catch {
            error = new Error();
            error.message = evt.message;
            error.stack = `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
        }
    }
    onAppError && onAppError(error);
});

window.addEventListener('unhandledrejection', evt => {
    onAppError && onAppError(evt.reason as Error);
});

namespace _cError {
    export class CommonError extends Error {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super();
            this.message = JSON.stringify(this);
        }
        public readonly name = CommonError.name;
    }

    export class ApiFetchFail extends CommonError {
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
        public readonly name = ApiFetchFail.name;
    }

    export class ApiJsonResultEmpty extends CommonError {
        constructor(
            public readonly details: {
                apiInfo: dRequest.ApiInfo;
            },
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name = ApiJsonResultEmpty.name;
    }

    export class ApiJsonResultError extends CommonError {
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
        public readonly name = ApiJsonResultError.name;
    }

    export class LoginError extends CommonError {
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
        public readonly name = LoginError.name;
    }

    export class VersionMismatch extends CommonError {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions);
        }
        public readonly name = VersionMismatch.name;
    }

    export class Noop extends Error {
        constructor(public msg?: string) {
            super();
            this.message = JSON.stringify(this);
        }
        public readonly name = Noop.name;
    }
}

export const cError: dp.DeepReadonly<typeof _cError> = _cError;
export default cError;

/**
 * @Creater cmZhou
 * @Desc 常用异常类
 */
let onAppError: undefined | ((err: Error) => dp.PromiseOrSelf<void>);
export const setOnAppError = (fn: (err: Error) => dp.PromiseOrSelf<void>) => onAppError = fn;

window.addEventListener('error', evt => {
    try {
        let error = evt.error as Error | undefined;
        if (!error) {
            let errName: keyof typeof cError | '' = '';
            try {
                const index = evt.message.indexOf(':');

                errName = evt.message.slice(0, index).trim() as keyof typeof cError;
                const jsonStr = evt.message.slice(index + 1);

                const errJson = JSON.parse(jsonStr);
                const ErrClass = cError[errName];

                error = new (ErrClass as any)() as Error;
                Object.assign(error, errJson);
            } catch {
                try {
                    // tslint:disable-next-line: no-unsafe-any
                    error = new (window as any)[errName]() as Error;
                } catch {
                    error = new Error();
                }
                error.message = evt.message;
                error.stack = `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
                error.name = errName || 'Error';
            }
        }
        onAppError && onAppError(error);
    } catch (e) {
        console.error('onerror fail', e);
    }
});

window.addEventListener('unhandledrejection', evt => {
    try {
        evt.promise.catch(err => onAppError && onAppError(err as Error));
    } catch (e) {
        console.error('onunhandledrejection fail', e);
    }
});

let shouldCompatible: undefined | (() => boolean);
export const setShouldCompatible = (fn: () => boolean) => shouldCompatible = fn;

namespace _cError {
    export class CommonError extends Error {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
            public readonly name = CommonError.name
        ) {
            super();

            if (shouldCompatible && shouldCompatible()) {
                this.message = JSON.stringify(this);
            }
        }
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
            super(options, logOptions, ApiFetchFail.name);
        }
    }

    export class ApiJsonResultEmpty extends CommonError {
        constructor(
            public readonly details: {
                apiInfo: dRequest.ApiInfo;
            },
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, ApiJsonResultEmpty.name);
        }
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
            super(options, logOptions, ApiJsonResultError.name);
        }
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
            super(options, logOptions, LoginError.name);
        }
    }

    export class VersionMismatch extends CommonError {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, VersionMismatch.name);
        }
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

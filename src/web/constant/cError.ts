/**
 * @Creater cmZhou
 * @Desc 常用异常类
 */
type ErrJson = {
    args: any[];
    stack?: string;
};

let onAppError: undefined | ((err: unknown) => dp.PromiseOrSelf<void>);
export const setOnAppError = (fn: (err: unknown) => dp.PromiseOrSelf<void>) => onAppError = fn;

window.addEventListener('error', evt => {
    try {
        let error = evt.error as Error | undefined;
        if (!error) {
            let errName: keyof typeof cError | '' = '';
            try {
                const index = evt.message.indexOf(':');

                errName = evt.message.slice(0, index).trim() as keyof typeof cError;
                const jsonStr = evt.message.slice(index + 1);

                const errJson = JSON.parse(jsonStr) as ErrJson;
                const ErrClass = cError[errName];

                error = new (ErrClass as any)(...errJson.args) as Error;
                error.stack = errJson.stack || `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
                error.message = '';
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
        onAppError && onAppError(evt.reason);
    } catch (e) {
        console.error('onunhandledrejection fail', e);
    }
});

let shouldCompatibleHandler: undefined | (() => boolean);
export const setShouldCompatibleHandler = (fn: () => boolean) => shouldCompatibleHandler = fn;

namespace _cError {
    const compatible = (instance: Error, args: any[]) => {
        if (shouldCompatibleHandler && shouldCompatibleHandler()) {
            instance.message = JSON.stringify({
                args,
                stack: instance.stack
            });
        }
    };

    export class CommonError extends Error {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
            public readonly name = CommonError.name
        ) {
            super();
            compatible(this, [...arguments]);
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
            compatible(this, [...arguments]);
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
            compatible(this, [...arguments]);
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
            compatible(this, [...arguments]);
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
            compatible(this, [...arguments]);
        }
    }

    export class VersionMismatch extends CommonError {
        constructor(
            public readonly options: dError.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, VersionMismatch.name);
            compatible(this, [...arguments]);
        }
    }

    export class Noop extends Error {
        constructor(public msg?: string) {
            super();
            compatible(this, [...arguments]);
        }
        public readonly name = Noop.name;
    }
}

export const cError: dp.DeepReadonly<typeof _cError> = _cError;
export default cError;

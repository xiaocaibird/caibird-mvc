/**
 * @Creater cmZhou
 * @Desc 常用异常类
 */
type ErrJson = {
    _compatible_key_: string;
    args: unknown[];
    stack?: string;
    message?: string;
};

let onAppError: undefined | ((err: unknown) => dp.PromiseOrSelf<void>);
export const setOnAppError = (fn: (err: unknown) => dp.PromiseOrSelf<void>) => onAppError = fn;

const getErrInfo = (message: string) => {
    let name;
    let json;
    try {
        const index = message.indexOf(':');

        name = message.slice(0, index).trim() as keyof typeof cError;

        const jsonStr = message.slice(index + 1);
        json = JSON.parse(jsonStr) as ErrJson;

        if (json._compatible_key_ !== errorCompatible) json = undefined;
    } catch {
    }

    return {
        name,
        json
    };
};

window.addEventListener('error', async evt => {
    try {
        let error = evt.error as Error | undefined;
        try {
            let errJson;
            if (!error) {
                let errName;
                try {
                    const errInfo = getErrInfo(evt.message);

                    errName = errInfo.name as keyof typeof cError;
                    errJson = errInfo.json as ErrJson;

                    const ErrClass = cError[errName];

                    error = new (ErrClass as any)(...errJson.args) as Error;
                    error.stack = errJson.stack || `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
                    error.message = errJson.message || '';
                } catch {
                    try {
                        // tslint:disable-next-line: no-unsafe-any
                        error = new (window as any)[errName || '']() as Error;
                    } catch {
                        error = new Error();
                    }
                    error.message = evt.message;
                    error.stack = `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
                    error.name = errName || 'Error';
                }
            }
            if (isCompatibleHandler) {
                if (error instanceof cError.BassError) {
                    error.message = errJson?.message || '';
                }
            }
        } catch { }
        onAppError && await onAppError(error);
    } catch (e) {
        console.error('onerror fail:', e);
        console.log('onerror evt:', evt);
    }
});

window.addEventListener('unhandledrejection', async evt => {
    try {
        const error = evt.reason;
        try {
            if (isCompatibleHandler) {
                if (error instanceof cError.BassError) {
                    error.message = getErrInfo(error.message).json?.message || '';
                }
            }
        } catch { }
        onAppError && await onAppError(error);
    } catch (e) {
        console.error('onunhandledrejection fail:', e);
        console.log('onunhandledrejection evt:', evt);
    }
});

let isCompatibleHandler = false;
export const setIsCompatibleHandler = (isCompatible: boolean) => isCompatibleHandler = isCompatible;

const errorCompatible = '_error__compatible___';

namespace _cError {
    const compatible = (instance: Error, args: unknown[]) => {
        try {
            if (isCompatibleHandler) {
                const obj: ErrJson = {
                    _compatible_key_: errorCompatible,
                    args,
                    stack: instance.stack,
                    message: instance.message
                };
                instance.message = JSON.stringify(obj);
            }
        } catch { }
    };

    export class BassError extends Error { }

    export class CommonError extends BassError {
        constructor(
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
            public readonly name = CommonError.name
        ) {
            super();
            compatible(this, [...arguments]);
        }
    }

    export class ReactError extends CommonError {
        constructor(
            public readonly details: {
                error: Error;
                errorInfo: React.ErrorInfo;
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, ReactError.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiFetchFail extends CommonError {
        constructor(
            public readonly details: {
                error: unknown;
                info: dRequest.F.WEB.FetchInfo;
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, ApiFetchFail.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultEmpty extends CommonError {
        constructor(
            public readonly details: {
                info: dRequest.F.WEB.FetchInfo;
            },
            public readonly options: dError.F.Options,
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
                info: dRequest.F.WEB.FetchInfo;
            },
            public readonly options: dError.F.Options,
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
                info: dRequest.F.WEB.FetchInfo;
            },
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, LoginError.name);
            compatible(this, [...arguments]);
        }
    }

    export class VersionMismatch extends CommonError {
        constructor(
            public readonly options: dError.F.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false
        ) {
            super(options, logOptions, VersionMismatch.name);
            compatible(this, [...arguments]);
        }
    }

    export class Noop extends BassError {
        constructor(public msg?: string) {
            super();
            compatible(this, [...arguments]);
        }
        public readonly name = Noop.name;
    }
}

export const cError: dp.DeepReadonly<typeof _cError> = _cError;
export default cError;

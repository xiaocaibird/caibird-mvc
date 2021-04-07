/**
 * @Owners cmZhou
 * @Title 常用异常类
 */
import { cError, setCompatible } from '../../@com/consts/cError';
type ErrJson = {
    _compatible_key_: string,
    args: unknown[],
    stack?: string,
    message?: string,
};

let onAppError: ((err: unknown) => dCaibird.PromiseOrSelf<void>) | undefined;
export const setOnAppError = (fn: (err: unknown) => dCaibird.PromiseOrSelf<void>) => onAppError = fn;

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
        json,
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

                    errName = errInfo.name;
                    errJson = errInfo.json;

                    if (errName && errJson) {
                        const ErrClass = cError[errName];

                        error = new (ErrClass as unknown as dCaibird.Class)(...errJson.args) as Error;
                        error.stack = errJson.stack || `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
                        error.message = errJson.message ?? '';
                    } else {
                        throw new Error();
                    }
                } catch {
                    try {
                        error = new (window as unknown as dCaibird.Obj<dCaibird.Class>)[errName ?? '']() as Error;
                    } catch {
                        error = new Error();
                    }
                    error.message = evt.message;
                    error.stack = `${evt.filename} | lineno: ${evt.lineno} | colno: ${evt.colno}`;
                    error.name = errName ?? 'Error';
                }
            }
            if (isCompatibleHandler) {
                if (error instanceof cError.BassError) {
                    error.message = errJson?.message ?? '';
                }
            }
        } catch { }
        onAppError && await onAppError(error);
    } catch (e: unknown) {
        console.error('onerror fail:', e);
        console.log('onerror evt:', evt);
    }
});

window.addEventListener('unhandledrejection', async evt => {
    try {
        const error: unknown = evt.reason;
        try {
            if (isCompatibleHandler) {
                if (error instanceof cError.BassError) {
                    error.message = getErrInfo(error.message).json?.message ?? '';
                }
            }
        } catch { }
        onAppError && await onAppError(error);
    } catch (e: unknown) {
        console.error('onunhandledrejection fail:', e);
        console.log('onunhandledrejection evt:', evt);
    }
});

let isCompatibleHandler = false;
export const setIsCompatibleHandler = (isCompatible: boolean) => isCompatibleHandler = isCompatible;

const errorCompatible = '_error__compatible___';

setCompatible((instance, args) => {
    try {
        if (isCompatibleHandler) {
            const obj: ErrJson = {
                _compatible_key_: errorCompatible,
                args,
                stack: instance.stack,
                message: instance.message,
            };
            instance.message = JSON.stringify(obj);
        }
    } catch { }
});

export { cError } from '../../@com/consts/cError';

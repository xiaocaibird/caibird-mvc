/**
 * @Owners cmZhou
 * @Title 常用异常类
 */
import type { PromptEnum } from '../helpers/hPrompt';
import type { RequestDeclare } from '../helpers/hRequest';

let compatible: (instance: Error, args: unknown[]) => void = () => { };

export const setCompatible = (fn: typeof compatible) => compatible = fn;

export declare namespace ErrorDeclare {
    type Options = {
        key: string,
        msg?: string,
        showPrompt?: PromptEnum.Type | false,
        promptStyleType?: PromptEnum.StyleType,
        onOk?: dCaibird.Func<[], void>,
        onCancel?: dCaibird.Func<[], void>,
        onEnd?: dCaibird.Func<[], void>,
    };
}

namespace _cError {
    export class BassError extends Error { }

    export class CommonError extends BassError {
        public constructor(
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
            public readonly name = CommonError.name,
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
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ReactError.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiFetchFail extends CommonError {
        public constructor(
            public readonly details: {
                error: unknown,
                info: RequestDeclare.FetchInfo,
            },
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiFetchFail.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultEmpty extends CommonError {
        public constructor(
            public readonly details: {
                info: RequestDeclare.FetchInfo,
            },
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiJsonResultEmpty.name);
            compatible(this, [...arguments]);
        }
    }

    export class ApiJsonResultError extends CommonError {
        public constructor(
            public readonly details: {
                rsp: dFetch.JsonBody,
                info: RequestDeclare.FetchInfo,
            },
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, ApiJsonResultError.name);
            compatible(this, [...arguments]);
        }
    }

    export class LoginError extends CommonError {
        public constructor(
            public readonly details: {
                rsp: dFetch.JsonBody,
                info: RequestDeclare.FetchInfo,
            },
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
        ) {
            super(options, logOptions, LoginError.name);
            compatible(this, [...arguments]);
        }
    }

    export class VersionMismatch extends CommonError {
        public constructor(
            public readonly options: ErrorDeclare.Options,
            public readonly logOptions: dReport.ErrorLogOptions | false = false,
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

        public readonly name = Noop.name;
    }
}

export const cError: dCaibird.DeepReadonly<typeof _cError> = _cError;

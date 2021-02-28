/**
 * @Creater cmZhou
 * @Desc report常用类型
 */
declare namespace dReport {
    type InitOptions = {
        maxLogSize?: {
            [k in eReport.LogType]?: number;
        },

        alwaysLog?: boolean,

        pathWhiteList?: string[],
        pathIgnoreList?: string[],
        projectLogName?: string,

        dbLogPathWhiteListWhenAlways?: string[],

        whiteListCtxKeys?: string[],
        whiteListCtxValues?: string[],

        useConsoleLog?: boolean,
    };

    type LogOptions = {
        key: string,
        msg?: string,
        details?: Partial<Error> | dp.Obj,
        error?: Partial<Error> | dp.Obj,
        source?: Partial<Error> | dp.Obj,
        attribute?: boolean,
        always?: boolean,
        type?: eReport.LogType,
        level?: 'info' | 'error',
    };

    type LogInfo = {
        type: eReport.LogType,
        level: 'info' | 'error',
        key: unknown,
        date: unknown,
        time: unknown,
        msg: unknown,
        uuid: unknown,
        fetchId: unknown,
        details: unknown,
        error: unknown,
        source: unknown,
        logStack: unknown,
        ctx: {
            header: {
                request: unknown,
                response: unknown,
            },
            body: {
                request: unknown,
                response: unknown,
            },
            type: {
                request: unknown,
                response: unknown,
            },
            query: unknown,
            ips: unknown,
            path: unknown,
            url: unknown,
            originalUrl: unknown,
            session: unknown,
            status: unknown,
            method: unknown,
        } | null,
    };

    type ErrorLogOptions = Omit<LogOptions, 'source' | 'key'> & {
        key?: string,
    };
}

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
        error?: any,
        source?: Partial<Error> | dp.Obj,
        attribute?: boolean,
        always?: boolean,
        type?: eReport.LogType,
        level?: 'info' | 'error',
    };

    type LogInfo = {
        type: eReport.LogType,
        level: 'info' | 'error',
        key: any,
        date: any,
        time: any,
        msg: any,
        uuid: any,
        fetchId: any,
        details: any,
        error: any,
        source: any,
        logStack: any,
        ctx: {
            header: {
                request: any,
                response: any,
            },
            body: {
                request: any,
                response: any,
            },
            type: {
                request: any,
                response: any,
            },
            query: any,
            ips: any,
            path: any,
            url: any,
            originalUrl: any,
            session: any,
            status: any,
            method: any,
        } | null,
    };

    type ErrorLogOptions = Omit<LogOptions, 'source' | 'key'> & {
        key?: string,
    };
}

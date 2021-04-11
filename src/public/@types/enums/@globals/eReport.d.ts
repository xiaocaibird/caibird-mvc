/**
 * @Owners cmZhou
 * @Title 日志常用枚举
 */
declare namespace Caibird.eReport {
    const enum LogType {
        Log = 'log',
        Error = 'error',
        UnknownError = 'unknownError',
        StatusError = 'statusError',

        BeginLog = 'beginLog',
        EndLog = 'endLog',

        DbError = 'dbError',
        DbLog = 'dbLog',

        TopError = 'topError',
        AppError = 'appError',

        WebLog = 'webLog',
        WebError = 'webError',
        WebTopError = 'webTopError',
        WebUnknownError = 'webUnknownError',
        WebReactError = 'webReactError',

        Other = 'other',
    }
}

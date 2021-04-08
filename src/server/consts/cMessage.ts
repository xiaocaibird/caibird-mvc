/**
 * @Owners cmZhou
 * @Title 常用消息
 */
namespace _cMessage {
    export const jsonError: { [K in Caibird.eFetch.JsonErrorCode]?: string; } = {
        [Caibird.eFetch.JsonErrorCode.CommonFail]: '请求失败！请稍后再试！',
        [Caibird.eFetch.JsonErrorCode.ParameterError]: '参数错误！请核对参数！',
        [Caibird.eFetch.JsonErrorCode.FetchError]: '请求失败！请稍后再试！',
        [Caibird.eFetch.JsonErrorCode.WebLogicError]: '页面过期！请刷新',
        [Caibird.eFetch.JsonErrorCode.Timeout]: '请求超时！',
        [Caibird.eFetch.JsonErrorCode.Maintenancing]: '系统维护中！请稍后再试！',
        [Caibird.eFetch.JsonErrorCode.LoginFail]: '登录失败！',

        [Caibird.eFetch.JsonErrorCode.NoLogin]: '未登录！',
        [Caibird.eFetch.JsonErrorCode.LoginInvalid]: '登录失效！您的账号已经在别的地方登录！',
        [Caibird.eFetch.JsonErrorCode.LoginExpired]: '登录过期！',
        [Caibird.eFetch.JsonErrorCode.IllegalLoginUser]: '非法的登录用户！',

        [Caibird.eFetch.JsonErrorCode.PermissionDenied]: '未授权！请先申请权限',

        [Caibird.eFetch.JsonErrorCode.DbError]: '数据库请求失败！请稍后再试！',

        [Caibird.eFetch.JsonErrorCode.UploadRequestError]: '上传失败！请稍后再试！',
        [Caibird.eFetch.JsonErrorCode.UploadFileSizeError]: '文件大小超过限制！',
        [Caibird.eFetch.JsonErrorCode.UploadFileIsEmpty]: '上传失败！文件为空！',
        [Caibird.eFetch.JsonErrorCode.UploadFileInitFail]: '文件初始化失败！',

        [Caibird.eFetch.JsonErrorCode.RedisError]: 'Redis请求失败！请稍后再试！',
    };

    export const httpStatus: { [K in Caibird.eHttp.StatusCode]?: string } = {
        [Caibird.eHttp.StatusCode.Ok]: 'OK',
        [Caibird.eHttp.StatusCode.TemporarilyMoved]: '302',
        [Caibird.eHttp.StatusCode.NotFound]: '您访问的地址不存在',
        [Caibird.eHttp.StatusCode.NoLogin]: '请您先登录！',
        [Caibird.eHttp.StatusCode.PermissionDenied]: '抱歉！您没有访问权限',
        [Caibird.eHttp.StatusCode.ServerError]: '服务器发生了未知错误，请稍后再试',
    };
}

export const cMessage: Caibird.dp.DeepReadonly<typeof _cMessage> = _cMessage;

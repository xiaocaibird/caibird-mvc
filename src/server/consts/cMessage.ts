/**
 * @Owners cmZhou
 * @Title 常用消息
 */
namespace _cMessage {
    export const jsonError: { [K in eFetch.JsonErrorCode]?: string; } = {
        [eFetch.JsonErrorCode.CommonFail]: '请求失败！请稍后再试！',
        [eFetch.JsonErrorCode.ParameterError]: '参数错误！请核对参数！',
        [eFetch.JsonErrorCode.FetchError]: '请求失败！请稍后再试！',
        [eFetch.JsonErrorCode.WebLogicError]: '页面过期！请刷新',
        [eFetch.JsonErrorCode.Timeout]: '请求超时！',
        [eFetch.JsonErrorCode.Maintenancing]: '系统维护中！请稍后再试！',
        [eFetch.JsonErrorCode.LoginFail]: '登录失败！',

        [eFetch.JsonErrorCode.NoLogin]: '未登录！',
        [eFetch.JsonErrorCode.LoginInvalid]: '登录失效！您的账号已经在别的地方登录！',
        [eFetch.JsonErrorCode.LoginExpired]: '登录过期！',
        [eFetch.JsonErrorCode.IllegalLoginUser]: '非法的登录用户！',

        [eFetch.JsonErrorCode.PermissionDenied]: '未授权！请先申请权限',

        [eFetch.JsonErrorCode.DbError]: '数据库请求失败！请稍后再试！',

        [eFetch.JsonErrorCode.UploadRequestError]: '上传失败！请稍后再试！',
        [eFetch.JsonErrorCode.UploadFileSizeError]: '文件大小超过限制！',
        [eFetch.JsonErrorCode.UploadFileIsEmpty]: '上传失败！文件为空！',
        [eFetch.JsonErrorCode.UploadFileInitFail]: '文件初始化失败！',

        [eFetch.JsonErrorCode.RedisError]: 'Redis请求失败！请稍后再试！',
    };

    export const httpStatus: { [K in eHttp.StatusCode]?: string } = {
        [eHttp.StatusCode.Ok]: 'OK',
        [eHttp.StatusCode.TemporarilyMoved]: '302',
        [eHttp.StatusCode.NotFound]: '您访问的地址不存在',
        [eHttp.StatusCode.NoLogin]: '请您先登录！',
        [eHttp.StatusCode.PermissionDenied]: '抱歉！您没有访问权限',
        [eHttp.StatusCode.ServerError]: '服务器发生了未知错误，请稍后再试',
    };
}

export const cMessage: dp.DeepReadonly<typeof _cMessage> = _cMessage;

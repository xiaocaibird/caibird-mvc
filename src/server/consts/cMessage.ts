/**
 * @Owners cmZhou
 * @Title 常用消息
 */
namespace _cMessage {
    export const jsonError: { [K in eCaibird.Fetch.JsonErrorCode]?: string; } = {
        [eCaibird.Fetch.JsonErrorCode.CommonFail]: '请求失败！请稍后再试！',
        [eCaibird.Fetch.JsonErrorCode.ParameterError]: '参数错误！请核对参数！',
        [eCaibird.Fetch.JsonErrorCode.FetchError]: '请求失败！请稍后再试！',
        [eCaibird.Fetch.JsonErrorCode.WebLogicError]: '页面过期！请刷新',
        [eCaibird.Fetch.JsonErrorCode.Timeout]: '请求超时！',
        [eCaibird.Fetch.JsonErrorCode.Maintenancing]: '系统维护中！请稍后再试！',
        [eCaibird.Fetch.JsonErrorCode.LoginFail]: '登录失败！',

        [eCaibird.Fetch.JsonErrorCode.NoLogin]: '未登录！',
        [eCaibird.Fetch.JsonErrorCode.LoginInvalid]: '登录失效！您的账号已经在别的地方登录！',
        [eCaibird.Fetch.JsonErrorCode.LoginExpired]: '登录过期！',
        [eCaibird.Fetch.JsonErrorCode.IllegalLoginUser]: '非法的登录用户！',

        [eCaibird.Fetch.JsonErrorCode.PermissionDenied]: '未授权！请先申请权限',

        [eCaibird.Fetch.JsonErrorCode.DbError]: '数据库请求失败！请稍后再试！',

        [eCaibird.Fetch.JsonErrorCode.UploadRequestError]: '上传失败！请稍后再试！',
        [eCaibird.Fetch.JsonErrorCode.UploadFileSizeError]: '文件大小超过限制！',
        [eCaibird.Fetch.JsonErrorCode.UploadFileIsEmpty]: '上传失败！文件为空！',
        [eCaibird.Fetch.JsonErrorCode.UploadFileInitFail]: '文件初始化失败！',

        [eCaibird.Fetch.JsonErrorCode.RedisError]: 'Redis请求失败！请稍后再试！',
    };

    export const httpStatus: { [K in eCaibird.Http.StatusCode]?: string } = {
        [eCaibird.Http.StatusCode.Ok]: 'OK',
        [eCaibird.Http.StatusCode.TemporarilyMoved]: '302',
        [eCaibird.Http.StatusCode.NotFound]: '您访问的地址不存在',
        [eCaibird.Http.StatusCode.NoLogin]: '请您先登录！',
        [eCaibird.Http.StatusCode.PermissionDenied]: '抱歉！您没有访问权限',
        [eCaibird.Http.StatusCode.ServerError]: '服务器发生了未知错误，请稍后再试',
    };
}

export const cMessage: Caibird.dp.DeepReadonly<typeof _cMessage> = _cMessage;

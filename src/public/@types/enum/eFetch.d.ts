/**
 * Created by cmZhou
 * 通信常用枚举
 */
declare namespace eFetch {
    const enum JsonSuccessCode {
        Success = 0
    }
    const enum JsonErrorCode {
        //#region 通用
        CommonFail = 10, // 失败
        ParameterError = 20, // 参数异常
        AjaxError = 30, // ajax执行异常
        WebLogicError = 40, // 前端逻辑异常，通常需要刷新页面
        Timeout = 50, // 超时
        Maintenancing = 60, // 系统维护中
        LoginFail = 70, // 登录失败
        //#endregion

        //#region 权限
        NoLogin = 1000, // 未登录
        LoginInvalid = 1001, // 登录失效
        LoginExpired = 1002, // 登录过期
        IllegalLoginUser = 1003, // 非法的登录用户

        PermissionDenied = 1100, // 未授权
        //#endregion

        //#region 数据库
        DbError = 2000, // 数据库异常
        //#endregion

        //#region 上传
        UploadRequestError = 4000, // 上传请求错误
        UploadFileSizeError = 4100, // 文件大小错误
        UploadFileIsEmpty = 4200, // 文件为空
        UploadFileInitFail = 4300, // 初始化失败

        UploadPartInitFail = 4500,
        UploadPartFail = 4600,
        UploadPartCompleteFail = 4700,
        //#endregion

        //#region Redis
        RedisError = 5000
        //#endregion
    }
}

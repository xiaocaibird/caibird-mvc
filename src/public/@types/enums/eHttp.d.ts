/**
 * @Creater cmZhou
 * @Desc http常用枚举
 */
declare namespace eHttp {
    const enum StatusCode {
        Ok = 200,
        TemporarilyMoved = 302,
        NoLogin = 401,
        PermissionDenied = 403,
        NotFound = 404,
        ServerError = 500,
    }

    const enum MethodType {
        POST = 'POST',
        GET = 'GET',
        PUT = 'PUT',
        DELETE = 'DELETE',
        OPTION = 'OPTIONS',
    }
    const enum ContentDispositionType {
        Inline = 'inline',
        Attachment = 'attachment',
    }
    const enum ContentType {
        TEXT = 'text/plain;charset=utf-8',
        JSON = 'application/json',
        FORM = 'application/x-www-form-urlencoded',
        XML = 'application/xml',
        MULTIPART = 'multipart/form-data',
    }
    const enum RequestedWith {
        XMLHttpRequest = 'XMLHttpRequest',
    }
}

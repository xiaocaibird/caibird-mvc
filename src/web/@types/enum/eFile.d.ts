/**
 * @Creater cmZhou
 * @Desc file 常用枚举
 */
declare namespace eFile {
    const enum FileReaderResultCode {
        Success = 0, Fail = 1, Timeout = 2
    }
    const enum FileReaderResultDateType {
        Binary = 0, ArrayBuffer = 1, DataUrl = 2
    }
}

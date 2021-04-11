/**
 * @Owners cmZhou
 * @Title eFile
 */
export namespace eFile {
    const enum FileReaderResultCode {
        Success = 0, Fail = 1, Timeout = 2,
    }
    const enum FileReaderResultDateType {
        Binary = 0, ArrayBuffer = 1, DataUrl = 2,
    }
}

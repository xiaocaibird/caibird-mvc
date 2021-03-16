/**
 * @Owners cmZhou
 * @Title file 常用类型
 */
declare namespace dFile {
    namespace F {
        type FileReaderResult<TData extends FileReader['result']> = {
            code: eFile.F.FileReaderResultCode,
            msg?: string,
            data?: TData,
            fileReader: FileReader,
            error?: ProgressEvent,
        };
    }
}

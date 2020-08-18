/**
 * Created by cmZhou
 * file 常用类型
 */
declare namespace dFile {
    type FileReaderResult<TData extends FileReader['result']> = {
        code: eFile.FileReaderResultCode;
        msg?: string;
        data?: TData;
        fileReader: FileReader;
        error?: ProgressEvent;
    };
}

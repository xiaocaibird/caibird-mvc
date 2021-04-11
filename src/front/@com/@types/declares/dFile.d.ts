/**
 * @Owners cmZhou
 * @Title dFile
 */
import { eFile } from '../enums';

export namespace dFile {
    type FileReaderResult<TData extends FileReader['result']> = {
        code: eFile.FileReaderResultCode,
        msg?: string,
        data?: TData,
        fileReader: FileReader,
        error?: ProgressEvent,
    };
}

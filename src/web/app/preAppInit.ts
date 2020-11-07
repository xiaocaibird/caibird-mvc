/**
 * @Creater cmZhou
 * @Desc preAppInit
 */
import { setIsCompatibleHandler, setOnAppError } from '../constant/cError';

import { setWriteLog } from './helper/reportHelper';

export default (opt: {
    isCompatibleAppErrorHandler?: boolean;
    writeLog?: dp.GetFuncParams<typeof setWriteLog>[0];
    onAppError?(err: unknown): any;
}) => {
    const { onAppError, isCompatibleAppErrorHandler, writeLog } = opt;
    onAppError && setOnAppError(onAppError);
    setIsCompatibleHandler(!!isCompatibleAppErrorHandler);
    writeLog && setWriteLog(writeLog);
};

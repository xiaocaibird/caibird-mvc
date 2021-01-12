/**
 * @Creater cmZhou
 * @Desc web app reportHelper
 */
import { uObject } from '../../../@common/util/uObject';

let writeLog: (opt: dReport.LogOptions) => void = () => { };

export const setWriteLog = (func: (opt: dReport.LogOptions) => void) => writeLog = func;

class ReportHelper {
    public static readonly instance = new ReportHelper();
    private constructor() { }

    public readonly log = (opt: dReport.LogOptions) => {
        try {
            const { details, error, source } = opt;
            const err = error as Error | undefined;
            writeLog(uObject.getSafeJsonObj({
                ...opt,
                details: details && {
                    name: details.name,
                    message: details.message,
                    stack: details.stack,
                    ...details
                },
                error: err && {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                    ...error
                },
                source: source && {
                    name: source.name,
                    message: source.message,
                    stack: source.stack,
                    ...source
                }
            }));
        } catch (e) {
            console.error('writeLog:', e);
        }
    }

    public readonly webLog = (opt: Omit<dReport.LogOptions, 'type'>) =>
        this.log({ ...opt, type: eReport.LogType.WebLog })

    public readonly webError = (opt: Omit<dReport.LogOptions, 'type'>) =>
        this.log({ ...opt, type: eReport.LogType.WebError })

    public readonly webReactError = (opt: Omit<dReport.LogOptions, 'type' | 'always' | 'attribute'>) =>
        this.log({ ...opt, type: eReport.LogType.WebReactError, always: true, attribute: true })

    public readonly webTopError = (opt: Omit<dReport.LogOptions, 'type' | 'always' | 'attribute'>) =>
        this.log({ ...opt, type: eReport.LogType.WebTopError, always: true, attribute: true })
}

const reportHelper = ReportHelper.instance;
export default reportHelper;
